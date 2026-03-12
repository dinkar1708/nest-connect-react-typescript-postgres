import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send request to yourself');
    }
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
    });
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new ConflictException('Friend request already sent');
      }
      if (existing.status === 'ACCEPTED') {
        throw new ConflictException('Already friends');
      }
    }
    const reverse = await this.prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId },
      },
    });
    if (reverse?.status === 'PENDING') {
      return this.acceptRequest(senderId, receiverId);
    }
    return this.prisma.friendRequest.create({
      data: { senderId, receiverId },
      include: {
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.receiverId !== userId) {
      throw new NotFoundException('Friend request not found');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request already processed');
    }
    await this.prisma.$transaction([
      this.prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      }),
      this.prisma.friendship.create({
        data: {
          user1Id: request.senderId < request.receiverId ? request.senderId : request.receiverId,
          user2Id: request.senderId < request.receiverId ? request.receiverId : request.senderId,
        },
      }),
    ]);
    return { message: 'Friend request accepted' };
  }

  async rejectRequest(userId: string, requestId: string) {
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });
    if (!request || request.receiverId !== userId) {
      throw new NotFoundException('Friend request not found');
    }
    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request already processed');
    }
    await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
    return { message: 'Friend request rejected' };
  }

  async getFriendList(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, email: true } },
        user2: { select: { id: true, name: true, email: true } },
      },
    });
    return friendships.map((f) =>
      f.user1Id === userId ? f.user2 : f.user1,
    );
  }

  async getPendingReceived(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getPendingSent(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: {
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId },
        ],
      },
    });
    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }
    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });
    return { message: 'Friend removed' };
  }
}

import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async areFriends(user1Id: string, user2Id: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id, user2Id },
          { user1Id: user2Id, user2Id: user1Id },
        ],
      },
    });
    return !!friendship;
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const friends = await this.areFriends(senderId, receiverId);
    if (!friends) {
      throw new ForbiddenException('Can only chat with friends');
    }
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getConversation(userId: string, otherUserId: string, limit = 50) {
    const friends = await this.areFriends(userId, otherUserId);
    if (!friends) {
      throw new ForbiddenException('Can only view messages with friends');
    }
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

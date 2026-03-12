import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: any) {
    const token = client.handshake?.auth?.token || client.handshake?.query?.token;
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      this.userSockets.set(payload.sub, client.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    if (client.userId) {
      this.userSockets.delete(client.userId);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() payload: { receiverId: string; content: string },
    @ConnectedSocket() client: any,
  ) {
    const userId = client.userId;
    if (!userId) return;
    const message = await this.chatService.sendMessage(
      userId,
      payload.receiverId,
      payload.content,
    );
    const receiverSocketId = this.userSockets.get(payload.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message', message);
    }
    return message;
  }
}

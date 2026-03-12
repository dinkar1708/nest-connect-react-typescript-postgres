import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send a message to a friend' })
  sendMessage(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      userId,
      dto.receiverId,
      dto.content,
    );
  }

  @Get('conversation/:userId')
  @ApiOperation({ summary: 'Get conversation with a friend' })
  getConversation(
    @CurrentUser('sub') userId: string,
    @Param('userId') otherUserId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.getConversation(
      userId,
      otherUserId,
      limit ? parseInt(limit, 10) : 50,
    );
  }
}

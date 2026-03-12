import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { MessageResponseDto } from './dto/message-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message to a friend' })
  @ApiCreatedResponse({ description: 'Message sent', type: MessageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Can only chat with friends', type: ErrorResponseDto })
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
  @ApiOkResponse({ description: 'Conversation messages', type: [MessageResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 403, description: 'Can only view messages with friends', type: ErrorResponseDto })
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

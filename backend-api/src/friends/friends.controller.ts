import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendRequestDto } from './dto/send-request.dto';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send friend request' })
  @ApiCreatedResponse({ description: 'Friend request sent or accepted' })
  @ApiResponse({ status: 400, description: 'Bad request', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'User not found', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Request already sent or already friends', type: ErrorResponseDto })
  sendRequest(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendRequestDto,
  ) {
    return this.friendsService.sendRequest(userId, dto.receiverId);
  }

  @Post('request/:id/accept')
  @ApiOperation({ summary: 'Accept friend request' })
  @ApiOkResponse({ description: 'Friend request accepted' })
  @ApiResponse({ status: 400, description: 'Request already processed', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Request not found', type: ErrorResponseDto })
  acceptRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.friendsService.acceptRequest(userId, requestId);
  }

  @Post('request/:id/reject')
  @ApiOperation({ summary: 'Reject friend request' })
  @ApiOkResponse({ description: 'Friend request rejected' })
  @ApiResponse({ status: 400, description: 'Request already processed', type: ErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Request not found', type: ErrorResponseDto })
  rejectRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.friendsService.rejectRequest(userId, requestId);
  }

  @Get()
  @ApiOperation({ summary: 'Get friend list' })
  @ApiOkResponse({ description: 'List of friends' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  getFriends(@CurrentUser('sub') userId: string) {
    return this.friendsService.getFriendList(userId);
  }

  @Get('requests/received')
  @ApiOperation({ summary: 'Get pending received friend requests' })
  @ApiOkResponse({ description: 'Pending received requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  getPendingReceived(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingReceived(userId);
  }

  @Get('requests/sent')
  @ApiOperation({ summary: 'Get pending sent friend requests' })
  @ApiOkResponse({ description: 'Pending sent requests' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  getPendingSent(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingSent(userId);
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove friend' })
  @ApiOkResponse({ description: 'Friend removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponseDto })
  @ApiResponse({ status: 404, description: 'Friendship not found', type: ErrorResponseDto })
  removeFriend(
    @CurrentUser('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendsService.removeFriend(userId, friendId);
  }
}

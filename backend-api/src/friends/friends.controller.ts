import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FriendsService } from './friends.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SendRequestDto } from './dto/send-request.dto';

@ApiTags('friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send friend request' })
  sendRequest(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendRequestDto,
  ) {
    return this.friendsService.sendRequest(userId, dto.receiverId);
  }

  @Post('request/:id/accept')
  @ApiOperation({ summary: 'Accept friend request' })
  acceptRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.friendsService.acceptRequest(userId, requestId);
  }

  @Post('request/:id/reject')
  @ApiOperation({ summary: 'Reject friend request' })
  rejectRequest(
    @CurrentUser('sub') userId: string,
    @Param('id') requestId: string,
  ) {
    return this.friendsService.rejectRequest(userId, requestId);
  }

  @Get()
  @ApiOperation({ summary: 'Get friend list' })
  getFriends(@CurrentUser('sub') userId: string) {
    return this.friendsService.getFriendList(userId);
  }

  @Get('requests/received')
  @ApiOperation({ summary: 'Get pending received friend requests' })
  getPendingReceived(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingReceived(userId);
  }

  @Get('requests/sent')
  @ApiOperation({ summary: 'Get pending sent friend requests' })
  getPendingSent(@CurrentUser('sub') userId: string) {
    return this.friendsService.getPendingSent(userId);
  }

  @Delete(':friendId')
  @ApiOperation({ summary: 'Remove friend' })
  removeFriend(
    @CurrentUser('sub') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.friendsService.removeFriend(userId, friendId);
  }
}

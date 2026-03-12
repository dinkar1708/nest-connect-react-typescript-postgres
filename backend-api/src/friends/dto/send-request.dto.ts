import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SendRequestDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  receiverId: string;
}

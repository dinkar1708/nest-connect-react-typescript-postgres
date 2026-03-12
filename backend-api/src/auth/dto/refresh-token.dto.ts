import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from login/signup' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateChatDTO {
  @ApiProperty()
  @IsString()
  roomName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  text: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  videoUrl: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  imageUrl: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  documentUrl: string;
}

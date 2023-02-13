import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateChatDTO {
  @IsString()
  roomName: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  text: string;

  @IsUrl()
  @IsOptional()
  videoUrl: string;

  @IsUrl()
  @IsOptional()
  imageUrl: string;

  @IsUrl()
  @IsOptional()
  documentUrl: string;
}

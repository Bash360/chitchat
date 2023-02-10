import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateChatDTO {
  @IsString()
  groupName: string;

  @IsString()
  @MaxLength(500)
  text: string;

  @IsString()
  sender: string;

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

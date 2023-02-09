import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateChatDTO {
  @IsString()
  groupID: string;

  @IsString()
  @MaxLength(200)
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

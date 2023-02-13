
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateChatDTO {
  @IsString()
  roomName: string;

  @IsString()
  @MaxLength(500)
  text: string;





}

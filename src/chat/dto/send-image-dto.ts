import { IsString, IsOptional, MaxLength } from 'class-validator';

export class SendImageDTO {
  @IsString()
  roomName: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  text: string;




}

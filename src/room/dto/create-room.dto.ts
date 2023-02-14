import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDTO {
  @IsString()
  @MaxLength(30)
  name: string;

  @IsString()
  @MaxLength(30)
  topic: string;
}


import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDTO {

  @IsString()
  @MaxLength(15)
  name: string;


  @IsString()
  topic: string;

}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(15)
  name: string;

  @ApiProperty()
  @IsString()
  topic: string;

}

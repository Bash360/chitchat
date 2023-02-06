import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class CreateGroupDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(15)
  name: string;

  @ApiProperty()
  @IsString()
  topic: string;

  @ApiProperty()
  @IsString()
  @Optional()
  avatar: string;
}

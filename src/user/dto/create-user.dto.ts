import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  @MaxLength(15)
  nickname: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  avatar: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}

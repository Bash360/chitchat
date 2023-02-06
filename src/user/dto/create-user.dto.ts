import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
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

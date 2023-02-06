import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  nickname: string;
  @IsString()
  @IsOptional()
  avatar: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

import { PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

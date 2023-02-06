import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './models/user.model';
import { CreateUserDTO } from './dto/create-user.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  @Get()
  async findAll(): Promise<User[]> {
    return [];
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User[]> {
    return [];
  }
  @Post()
  async createUser(@Body() createUser: CreateUserDTO): Promise<User[]> {
    return [];
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string): Promise<User> {
    return new User();
  }
}

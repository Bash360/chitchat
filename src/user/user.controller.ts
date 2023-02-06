import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './models/user.model';
import { CreateUserDTO } from './dto/create-user.dto';
import { PaginationDTO } from 'src/common/pagination-dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDTO: PaginationDTO): Promise<User[]> {
    return this.userService.findAll(paginationDTO);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUser: CreateUserDTO): Promise<User> {
    return this.userService.createUser(createUser);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string): Promise<User> {
    return new User();
  }
}

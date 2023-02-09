import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './models/user.model';
import { CreateUserDTO } from './dto/create-user.dto';
import { PaginationDTO } from 'src/common/pagination-dto';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { throwReadableMessages } from 'src/common/helpers';

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
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType:
            /(^image)(\/)[jpeg,jpg,png,x\-png,bmp,gif,avif,webp,svg+xml]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
        }),
    )
    file: Express.Multer.File,
    @Body()
    createUser: CreateUserDTO,
  ): Promise<User> {
    return this.userService.createUser(createUser, file);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUser: UpdateUserDTO,
  ): Promise<User> {
    return this.userService.updateUser(id, updateUser);
  }
}

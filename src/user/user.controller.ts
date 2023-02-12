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
  Headers
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from './models/user.model';
import { CreateUserDTO } from './dto/create-user.dto';
import { PaginationDTO } from 'src/common/pagination-dto';
import { UserService } from './user.service';
import { UpdateUserDTO } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { throwReadableMessages } from 'src/common/helpers';
import { IsOptional } from 'class-validator';
import { Public } from 'src/common/decorators';
import { LoginDTO } from './dto/login.dto';

@ApiTags('users')
@Controller('users')
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
  @Public()
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body()
    createUser: CreateUserDTO,

    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType:
            /(^image)(\/)[jpeg,jpg,png,x\-png,bmp,gif,avif,webp,svg+xml]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ): Promise<User> {
    console.log('okay');
    return this.userService.createUser(createUser, file);
  }

  @Post('signin')
  @Public()
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() loginDTO: LoginDTO): Promise<any> {
    return this.userService.validateUser(loginDTO);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Headers('authorization') auth: string,
    @Body()
    updateUser: UpdateUserDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1_000_000 })
        .addFileTypeValidator({
          fileType:
            /(^image)(\/)[jpeg,jpg,png,x\-png,bmp,gif,avif,webp,svg+xml]*/i,
        })
        .build({
          exceptionFactory: throwReadableMessages,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ): Promise<User> {
    return this.userService.updateUser(auth, updateUser, file);
  }
}

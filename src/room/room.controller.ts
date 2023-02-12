import {
  Controller,
  HttpCode,
  HttpStatus,
  Query,
  Get,
  Post,
  Param,
  Body,
  Patch,
  UploadedFile,
  ParseFilePipeBuilder,
  UseInterceptors,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination-dto';
import { RoomService } from './room.service';
import { Room } from './models/room.model';
import { CreateRoomDTO } from './dto/create-room.dto';
import { UpdateRoomDTO } from './dto/update.room.dto';
import { throwReadableMessages } from 'src/common/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators';

@ApiTags('rooms')
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationQuery: PaginationDTO): Promise<Room[]> {
    return this.roomService.findAll(paginationQuery);
  }

  @Get(':id')
  @HttpCode(HttpStatus.FOUND)
  async findOne(@Param('id') id: string): Promise<Room> {
    return this.roomService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  async createRoom(
    @Body() createRoom: CreateRoomDTO,
    @Headers('authorization') auth: string,
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
  ): Promise<Room> {
    return this.roomService.createRoom(createRoom, auth, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  async UpdateRoom(
    @Param('id') id: string,
    @Body() updateRoom: UpdateRoomDTO,
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
  ): Promise<Room> {
    return this.roomService.updateRoom(id, updateRoom, file);
  }
}

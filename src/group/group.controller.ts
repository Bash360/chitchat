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
import { GroupService } from './group.service';
import { Group } from './models/group.model';
import { CreateGroupDTO } from './dto/create-group.dto';
import { UpdateGroupDTO } from './dto/update.group.dto';
import { throwReadableMessages } from 'src/common/helpers';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/common/decorators';

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationQuery: PaginationDTO): Promise<Group[]> {
    return this.groupService.findAll(paginationQuery);
  }

  @Get(':id')
  @HttpCode(HttpStatus.FOUND)
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Body() createGroup: CreateGroupDTO,
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
  ): Promise<Group> {
    return this.groupService.createGroup(createGroup, auth, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  async UpdateGroup(
    @Param('id') id: string,
    @Body() updateGroup: UpdateGroupDTO,
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
  ): Promise<Group> {
    return this.groupService.updateGroup(id, updateGroup, file);
  }
}

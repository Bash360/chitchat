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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination-dto';
import { GroupService } from './group.service';
import { Group } from './models/group.model';
import { CreateGroupDTO } from './dto/create-group.dto';
import { UpdateGroupDTO } from './dto/update.group.dto';

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationQuery: PaginationDTO): Promise<Group[]> {
    return this.groupService.findAll(paginationQuery);
  }

  @Get(':id')
  @HttpCode(HttpStatus.FOUND)
  async findOne(@Param('id') id: string): Promise<Group> {
    return this.groupService.findOne(id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.CREATED)
  async createGroup(
    @Param('id') id: string,
    @Body() createGroup: CreateGroupDTO,
  ): Promise<Group> {
    return this.groupService.createGroup(id, createGroup);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async UpdateGroup(
    @Param('id') id: string,
    @Body() updateGroup: UpdateGroupDTO,
  ): Promise<Group> {
    return this.groupService.updateGroup(id, updateGroup);
  }

}

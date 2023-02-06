import { Controller, HttpCode, HttpStatus, Query, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination-dto';
import { GroupService } from './group.service';
import { Group } from './models/group.model';

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationQuery: PaginationDTO): Promise<Group[]> {
    return this.groupService.findAll(paginationQuery);
  }
}

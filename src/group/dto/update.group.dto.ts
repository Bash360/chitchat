import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGroupDTO } from './create-group.dto';

export class UpdateGroupDTO extends PartialType(
  OmitType(CreateGroupDTO, ['name']),
) {}

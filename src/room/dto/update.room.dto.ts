import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoomDTO } from './create-room.dto';

export class UpdateRoomDTO extends PartialType(
  OmitType(CreateRoomDTO, ['name']),
) {}

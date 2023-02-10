import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination-dto';
import { ChatService } from './chat.service';
import { Chat } from './models/chat.model';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(':roomID')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('roomID') roomID: string,
    @Query() pagination: PaginationDTO,
  ): Promise<Chat[]> {
    return this.chatService.findAll(roomID, pagination);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteChat(@Param('id') id: string): Promise<Chat> {
    return this.chatService.deleteChat(id);
  }
}

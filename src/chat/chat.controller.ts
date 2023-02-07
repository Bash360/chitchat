import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginationDTO } from 'src/common/pagination-dto';
import { ChatService } from './chat.service';
import { Chat } from './models/chat.model';
import { CreateChatDTO } from './dto/create-chat.dto';

@Controller('chat')
@ApiTags('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get(':groupID')
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Param('groupID') groupID: string,
    @Query() pagination: PaginationDTO,
  ): Promise<Chat[]> {
    return this.chatService.findAll(groupID, pagination);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChat(@Body() createChatDTO: CreateChatDTO): Promise<Chat> {
    return this.chatService.createChat(createChatDTO);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteChat(@Param('id') id: string): Promise<Chat> {
    return this.chatService.deleteChat(id);
  }
}

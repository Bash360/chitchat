import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from 'src/chat/chat.service';
import { CreateChatDTO } from 'src/chat/dto/create-chat.dto';
import { Chat } from 'src/chat/models/chat.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@ApiTags('chatting')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  async handleConnection(socket: Socket) {
    // await this.chatService.getUserFromSocket(socket);
  }

  // @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('send-message')
  async handleMessages(
    @MessageBody() data,
    @ConnectedSocket() socket: Socket,
  ): Promise<Chat> {
    const sender = await this.chatService.getUserFromSocket(socket);

    const chat = await this.chatService.createChat(data, sender);
    socket.broadcast.emit('receive-message', { chat });

    return chat;
  }

  @SubscribeMessage('request_all_messages')
  async getAllMessagesFromGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody('id') roomId: string,
  ) {
    await this.chatService.getUserFromSocket(socket);
    const chats = await this.chatService.findAll(roomId);
    socket.emit('send_all_messages', chats);
  }

  @SubscribeMessage('join-room')
  async joinRoom(@ConnectedSocket() socket: Socket) {}
}

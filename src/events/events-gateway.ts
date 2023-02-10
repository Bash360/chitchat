import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from 'src/chat/chat.service';
import { Chat } from 'src/chat/models/chat.model';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    await this.chatService.getUserFromSocket(socket);
  }

  @SubscribeMessage('send-message')
  async handleMessages(
    @MessageBody() data,
    @ConnectedSocket() socket: Socket,
  ): Promise<Chat> {
    const sender = await this.chatService.getUserFromSocket(socket);

    const chat = await this.chatService.createChat(data, sender);
    this.server.sockets.to(data.room).emit('receive-message', { data, chat });

    return chat;
  }

  @SubscribeMessage('request_all_messages')
  async getAllMessages(
    @ConnectedSocket() socket: Socket,
    @MessageBody('id') groupId: string,
  ) {
    await this.chatService.getUserFromSocket(socket);
    const chats = await this.chatService.findAll(groupId);
    socket.emit('send_all_messages', chats);
  }
}

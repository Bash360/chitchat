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
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
@ApiTags('chatting')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseGuards(JwtAuthGuard)
  async handleConnection(socket: Socket) {
    // await this.chatService.getUserFromSocket(socket);
  }
  afterInit(socket: Socket) {
    console.log(socket);
  }

  // @UsePipes(new ValidationPipe())
  // @UseGuards(JwtAuthGuard)
  @SubscribeMessage('createChat')
  async handleMessages(
    @MessageBody() data: CreateChatDTO,
    @ConnectedSocket() socket: Socket,
  ): Promise<Chat> {
    const sender = await this.chatService.getUserFromSocket(socket);

    const chat = await this.chatService.createChat(data, sender);
    socket.to(data.roomName).emit('receiveChat', chat);

    return chat;
  }

  @SubscribeMessage('requestAllChats')
  async getAllMessagesFromGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody('id') roomId: string,
  ) {
    await this.chatService.getUserFromSocket(socket);
    const chats = await this.chatService.findAll(roomId);
    socket.emit('receiveAllChats', chats);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('roomName') roomName: string,
  ) {
    const room = await this.roomService.findByName(roomName);
    const user = await this.chatService.getUserFromSocket(socket);

    this.userService.joinRoom(user, room);
    socket.join(roomName);
    socket.to(room.name).emit('welcomeNewUser', user);
  }

  @SubscribeMessage('createdRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('name') name: string,
  ) {
    const existingRoom = await this.roomService.findOne(name);
    const existingUser = await this.chatService.getUserFromSocket(socket);
    this.userService.joinRoom(existingUser, existingRoom);
    socket.join(existingRoom.name);
    socket.broadcast.emit('newRoom', existingRoom);
  }
}

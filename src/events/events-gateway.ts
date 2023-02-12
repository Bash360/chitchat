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

  async handleConnection(socket: Socket) {
    try {
      await this.chatService.getUserFromSocket(socket);
    } catch (error) {
      socket._error(error);
      return;
    }
  }
  afterInit(socket: Socket) {
    console.log('Gate way connection established :events GATEWAY');
  }
  async handleDisconnect(socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);

    socket._cleanup();

    socket.broadcast.emit('leftRoom', user);
  }
  // @UsePipes(new ValidationPipe())
  @SubscribeMessage('createChat')
  async handleMessages(
    @MessageBody() data: CreateChatDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const sender = await this.chatService.getUserFromSocket(socket);

      const chat = await this.chatService.createChat(data, sender);
      if (!socket.rooms.has(data.roomName.toLowerCase())) {
        throw new WsException('you have to join room first');
      }

      socket.data = { message: 'successful', status: 201 };
      delete chat.sender;
      socket.to(data.roomName).emit('receiveChat', { ...chat, sender: sender });

      return;
    } catch (error) {
      console.log(error);
      socket._error(error);
      return;
    }
  }

  @SubscribeMessage('requestAllChats')
  async getAllMessagesFromGroup(
    @ConnectedSocket() socket: Socket,
    @MessageBody('id') roomId: string,
  ) {
    try {
      await this.chatService.getUserFromSocket(socket);
      const room = await this.roomService.findOne(roomId);
      if (!socket.rooms.has(room.name.toLowerCase())) {
        throw new WsException('you have to join room first');
      }
      const chats = await this.chatService.findAll(roomId);
      socket.emit('receiveAllChats', chats);
    } catch (error) {
      socket._error(error);
      return;
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('roomName') roomName: string,
  ) {
    try {
      if (!socket.rooms.has(roomName.toLowerCase())) {
        socket.emit('alreadyJoined', 'you are already part of the group');
      }
      const room = await this.roomService.findByName(roomName);

      const user = await this.chatService.getUserFromSocket(socket);

      socket.join(roomName);
      socket.to(room.name).emit('welcomeNewUser', user);
    } catch (error) {
      socket._error(error);
      return;
    }
  }

  @SubscribeMessage('createdRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('name') name: string,
  ) {
    try {
      const existingRoom = await this.roomService.findOne(name);

      socket.join(existingRoom.name);
      socket.broadcast.emit('newRoom', existingRoom);
    } catch (error) {
      socket._error(error);
      return;
    }
  }

  @SubscribeMessage('roomsJoined')
  async allRoomsJoinedByuser(@ConnectedSocket() socket: Socket) {
    const rooms = socket.rooms;
    socket.emit('userCurrentRooms', rooms);
  }
}

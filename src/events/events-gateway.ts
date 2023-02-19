import { UsePipes, ValidationPipe } from '@nestjs/common';

import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from 'src/chat/chat.service';
import { CreateChatDTO } from 'src/chat/dto/create-chat.dto';
import { RoomService } from '../room/room.service';
import { getParam, validationError } from 'src/common/helpers';
import { UserService } from 'src/user/user.service';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: validationError,
  }),
)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly roomService: RoomService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    try {
      const user = await this.chatService.getUserFromSocket(socket);
      this.userService.isOnline(user._id, true);

      socket.recovered;
    } catch (error) {
      socket._error(error);
      return;
    }
  }
  afterInit() {
    console.log('Gate way connection established :events GATEWAY');
  }
  async handleDisconnect(socket: Socket) {
    const user = await this.chatService.getUserFromSocket(socket);
    this.userService.isOnline(user._id, false);
    socket._cleanup();

    socket.broadcast.emit('leftRoom', user);
  }

  @SubscribeMessage('createChat')
  async handleMessages(
    @MessageBody()
    data: CreateChatDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (!data.text && !data.imageUrl && !data.videoUrl && !data.documentUrl)
        throw new WsException('chat cannot be empty');
      const sender = await this.chatService.getUserFromSocket(socket);

      const chat = await this.chatService.createChat(data, sender);
      if (!socket.rooms.has(data.roomName.toLowerCase())) {
        throw new WsException('you have to join room first');
      }

      socket.data = { message: 'successful', status: 201 };
      delete chat.sender;
      socket
        .to(data.roomName.toLowerCase())
        .emit('receiveChat', { ...chat, sender: sender });

      return;
    } catch (error) {
      console.log('from pipe', error);
      socket._error(error);
      return;
    }
  }

  @SubscribeMessage('requestAllChats')
  async getAllMessagesFromRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody('id') id: string,
  ) {
    try {
      const limit = getParam('limit', socket.request.url);
      const skip = getParam('skip', socket.request.url);

      await this.chatService.getUserFromSocket(socket);

      const room = await this.roomService.findOne(id);
      if (!socket.rooms.has(room.name.toLowerCase())) {
        throw new WsException('you have to join room first');
      }
      const chats = await this.chatService.findAll(id, { limit, skip });
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
      if (socket.rooms.has(roomName.toLowerCase())) {
        throw new WsException('you are already part of the group');
      }
      const room = await this.roomService.findByName(roomName);

      const user = await this.chatService.getUserFromSocket(socket);

      socket.join(room.name);
      socket.to(room.name).emit('welcomeNewUser', user);
      return { status: 'successful' };
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

  @SubscribeMessage('closeChat')
  async closeChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody('roomName') roomName: string,
  ) {
    try {
      const sender = await this.chatService.getUserFromSocket(socket);
      const room = await this.roomService.findByName(roomName);
      if (!socket.rooms.has(room.name.toLowerCase())) {
        throw new WsException('you have to join room first');
      }

      socket.leave(room.name);
      socket.to(room.name).emit('leftRoom', { user: sender });
    } catch (error) {
      socket._error(error);
      return;
    }
  }
}

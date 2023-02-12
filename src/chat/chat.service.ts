import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { chat } from 'src/common/constants';
import { Chat } from './models/chat.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { RoomService } from 'src/room/room.service';
import { AuthService } from '../auth/auth.service';
import { getToken } from 'src/common/gettoken';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { User } from 'src/user/models/user.model';
import { CreateChatDTO } from './dto/create-chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(chat) private readonly chatModel: Model<Chat>,
    private readonly roomService: RoomService,
    private readonly authService: AuthService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  async findAll(groupID: string, pagination?: PaginationDTO): Promise<Chat[]> {
    return this.chatModel
      .find({ groupID: groupID })
      .skip(pagination?.skip ? pagination.skip : 0)
      .limit(pagination?.limit ? pagination.limit : 100)
      .sort({ createdAt: -1 })
      .exec();
  }

  async createChat(createChat: CreateChatDTO, sender: User): Promise<Chat> {
    const room = await this.roomService.findByName(createChat.roomName);
    if (!room) {
      throw new WsException('room with the name does');
    }
    const chat = await new this.chatModel({
      sender: sender.id,
      roomID: room.id,
      text: createChat.text,
    });

    return chat.save();
  }

  async deleteChat(id: string): Promise<Chat> {
    try {
      const chat = await this.chatModel.findOneAndDelete({ _id: id }).exec();

      if (chat) return chat;
      throw new NotFoundException('chat with ID not found');
    } catch (error) {
      throw new NotFoundException('chat with ID not found');
    }
  }

  async getUserFromSocket(socket: Socket) {
    const auth = socket.handshake.headers.authorization;
    if (!auth) {
      throw new WsException('Invalid credentials you need to log in');
    }
    const payload = await this.authService.extract(getToken(auth));
    const user = await this.jwtStrategy.validate(payload);
    if (!user) throw new WsException('Invalid credentials you need to log in');

    return user;
  }
}

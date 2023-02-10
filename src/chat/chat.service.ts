import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { chat } from 'src/common/constants';
import { Chat } from './models/chat.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { CreateChatDTO } from './dto/create-chat.dto';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';
import { AuthService } from '../auth/auth.service';
import { getToken } from 'src/common/gettoken';

import { WsException } from '@nestjs/websockets';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { User } from 'src/user/models/user.model';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(chat) private readonly chatModel: Model<Chat>,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
    private readonly jwtStrategy: JwtStrategy,
  ) {}

  async findAll(groupID: string, pagination?: PaginationDTO): Promise<Chat[]> {
    const { skip, limit } = pagination;
    return this.chatModel
      .find({ groupID: groupID })
      .skip(skip ? skip : 0)
      .limit(limit ? limit : 100)
      .sort({ createdAt: -1 })
      .exec();
  }

  async createChat({ room, message }, sender: User): Promise<Chat> {
    const group = await this.groupService.findByName(room);

    const chat = await new this.chatModel({
      sender: sender,
      groupID: group.id,
      text: message,
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

  async getUserFromSocket(socket) {
    const auth = socket.handshake.headers.authorization;
    const payload = await this.authService.extract(getToken(auth));
    const user = await this.jwtStrategy.validate(payload);
    if (!user) throw new WsException('Invalid credentials.');
    return user;
  }
}

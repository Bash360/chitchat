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

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(chat) private readonly chatModel: Model<Chat>,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
    private readonly authService: AuthService,
  ) {}

  async findAll(groupID: string, pagination: PaginationDTO): Promise<Chat[]> {
    const { skip, limit } = pagination;
    return this.chatModel
      .find({ groupID: groupID })
      .skip(skip ? skip : 0)
      .limit(limit ? limit : 10)
      .sort({ createdAt: -1 })
      .exec();
  }

  async createChat(createChat: CreateChatDTO, auth: string): Promise<Chat> {
    const payload = await this.authService.extract(getToken(auth));
    const group = await this.groupService.findOne(createChat.groupID);

    const chat = await new this.chatModel({
      ...createChat,
      groupID: group._id,
      sender: payload.id,
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
}

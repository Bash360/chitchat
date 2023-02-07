import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { chat } from 'src/common/constants';
import { Chat } from './models/chat.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { CreateChatDTO } from './dto/create-chat.dto';
import { UserService } from 'src/user/user.service';
import { GroupService } from 'src/group/group.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(chat) private readonly chatModel: Model<Chat>,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
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

  async createChat(createChat: CreateChatDTO): Promise<Chat> {
    const group = await this.groupService.findOne(createChat.groupID);
    const user = await this.userService.findOne(createChat.sender);
    const chat = await new this.chatModel({
      ...createChat,
      groupID: group._id,
      sender: user._id,
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

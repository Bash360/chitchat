import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { group } from 'src/common/constants';
import { Group } from './models/group.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { UserService } from 'src/user/user.service';
import { CreateGroupDTO } from './dto/create-group.dto';
import { UpdateUserDTO } from 'src/user/dto/update-user.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(group) private readonly groupModel: Model<Group>,
    private readonly userService: UserService,
  ) {}
  async findAll(paginationQuery: PaginationDTO): Promise<Group[]> {
    const { skip, limit } = paginationQuery;

    return this.groupModel.find().skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<Group> {
    try {
      const group = await this.groupModel
        .findOne({ _id: id }, { __v: 0 })
        .exec();
      if (group) return group;
      throw new NotFoundException('group with that ID not found');
    } catch (error) {
      throw new NotFoundException('group with that ID not found');
    }
  }

  async createGroup(
    userId: string,
    createGroup: CreateGroupDTO,
  ): Promise<Group> {
    const user = await this.userService.findOne(userId);
    const group = await new this.groupModel({
      ...createGroup,
      createdBy: user._id,
    });

    return group.save();
  }

  async updateGroup(id: string, updateGroup: UpdateUserDTO): Promise<Group> {
    try {
      const group = await this.groupModel
        .findOneAndUpdate({ _id: id }, { $set: updateGroup }, { new: true })
        .exec();
      if (group) return group;
      throw new NotFoundException('Group with ID not found');
    } catch (error) {
      throw new NotFoundException('Group with ID not found');
    }
  }
}

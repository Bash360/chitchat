import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { group } from 'src/common/constants';
import { Group } from './models/group.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { UserService } from 'src/user/user.service';
import { CreateGroupDTO } from './dto/create-group.dto';
import { UpdateUserDTO } from 'src/user/dto/update-user.dto';
import { UpdateGroupDTO } from './dto/update.group.dto';
import { FileService } from '../file/file.service';
import { Express } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { getToken } from 'src/common/gettoken';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(group) private readonly groupModel: Model<Group>,
    private readonly userService: UserService,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
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
    createGroup: CreateGroupDTO,
    auth: string,
    file?: Express.Multer.File,
  ): Promise<Group> {
    const payload = await this.authService.extract(getToken(auth));

    let result;
    console.log(result);
    const group = await new this.groupModel({
      ...createGroup,
      createdBy: payload.id,
    });

    if (file) {
      result = await this.fileService.uploadImage(file);
      group.avatar = result.imageURL;
    }

    return group.save();
  }

  async updateGroup(
    id: string,
    updateGroup: UpdateGroupDTO,
    file?: Express.Multer.File,
  ): Promise<Group> {
    try {
      let result;
      if (file) {
        result = await this.fileService.uploadImage(file);
      }
      const group = await this.groupModel
        .findOneAndUpdate(
          { _id: id },
          { $set: updateGroup, avatar: result?.imageURL },
          { new: true },
        )
        .exec();
      if (group) return group;
      throw new NotFoundException('Group with ID not found');
    } catch (error) {
      throw new NotFoundException('Group with ID not found');
    }
  }
}

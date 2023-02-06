import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { user } from 'src/common/constants';
import { User } from './models/user.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { CreateUserDTO } from './dto/create-user.dto';
import * as argon from 'argon2';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(user.toString()) private readonly userModel: Model<User>,
  ) {}

  async findAll(paginationQuery: PaginationDTO): Promise<User[]> {
    const { skip, limit } = paginationQuery;

    return this.userModel
      .find({}, { password: 0, _v: 0 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ _id: id }, { password: 0, __v: 0 })
        .exec();
      if (user) return user;
      throw new NotFoundException('user with ID not found');
    } catch (error) {
      throw new NotFoundException('user with ID not found');
    }
  }

  async createUser(createUser: CreateUserDTO): Promise<User> {
    const existingUser = await this.existingUser('email', createUser.email);
    if (existingUser) {
      throw new HttpException(
        'user with this email already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const passwordHash = await argon.hash(createUser.password);

    createUser.password = passwordHash;

    const user = await new this.userModel({ ...createUser });
    return user.save();
  }

  async updateUser(id: string, updateUser: UpdateUserDTO): Promise<User> {
    try {
      const user = await this.userModel
        .findOneAndUpdate({ _id: id }, { $set: updateUser }, { new: true })
        .exec();
      if (!user) {
        throw new NotFoundException('user with ID not found');
      }
      return user;
    } catch (error) {
      throw new NotFoundException('user with ID not found');
    }
  }

  private async existingUser(field: string, value: string): Promise<boolean> {
    let user;
    switch (field) {
      case 'email':
        user = await this.userModel.findOne({ email: value });
        break;
      default:
        user = await this.userModel.findOne({ _id: value });
    }

    return user ? true : false;
  }
}

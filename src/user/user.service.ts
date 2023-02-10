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
import { FileService } from '../file/file.service';
import { LoginDTO } from './dto/login.dto';
import { AuthService } from 'src/auth/auth.service';
import { getToken } from '../common/gettoken';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(user.toString()) private readonly userModel: Model<User>,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
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

  async createUser(
    createUser: CreateUserDTO,
    file?: Express.Multer.File,
  ): Promise<User> {
    const existingUser = await this.existingUser('email', createUser.email);
    if (existingUser) {
      throw new HttpException(
        'user with this email already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const passwordHash = await argon.hash(createUser.password);

    createUser.password = passwordHash;
    let result;
    const user = await new this.userModel({ ...createUser });
    if (file) {
      result = await this.fileService.uploadImage(file);
      user.avatar = result.imageURL;
    }

    return user.save();
  }

  async updateUser(
    auth: string,

    updateUser: UpdateUserDTO,
    file?: Express.Multer.File,
  ): Promise<User> {
    try {
      let result;
      const payload = await this.authService.extract(getToken(auth));
      if (updateUser.password) {
        const passwordHash = await argon.hash(updateUser.password);

        updateUser.password = passwordHash;
      }

      if (file) {
        result = await this.fileService.uploadImage(file);
      }

      const user = await this.userModel
        .findOneAndUpdate(
          { _id: payload.id },
          { $set: updateUser, avatar: result?.imageURL },
          { new: true },
        )
        .exec();
      if (!user) {
        throw new NotFoundException('user with ID not found');
      }

      return user;
    } catch (error) {
      throw new NotFoundException('user with ID not found');
    }
  }
  async validateUser(loginDTO: LoginDTO): Promise<any> {
    const { email, password } = loginDTO;
    const user = await this.userModel.findOne({ email: email }).exec();
    if (user && (await argon.verify(user.password, password))) {
      return this.authService.login(user);
    } else {
      throw new HttpException(
        'user credentials invalid',
        HttpStatus.BAD_REQUEST,
      );
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

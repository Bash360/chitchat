import {
  BadRequestException,
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
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(user.toString()) private readonly userModel: Model<User>,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  async findAll(paginationQuery?: PaginationDTO): Promise<User[]> {
    const { skip, limit } = paginationQuery;

    return this.userModel
      .find({ verified: true }, { password: 0, _v: 0 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel
        .findOne({ _id: id, verified: true }, { __v: 0, password: 0 })
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

    const savedUser = await user.save();
    const token = await this.authService.verify(savedUser._id);
    this.sendEmail(savedUser.email, savedUser.nickname, token.access_token);
    return savedUser;
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
          { _id: payload.id, verified: true },
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
    const user = await this.userModel
      .findOne({ email: email, verified: true })
      .exec();
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

  async verifyUser(token: string): Promise<any> {
    try {
      const payload = await this.authService.extract(token);

      const user = await this.userModel
        .findOneAndUpdate(
          { _id: payload.id },
          { $set: { verified: true } },
          { new: true },
        )
        .exec();
      if (!user) {
        throw new NotFoundException('user with ID not found');
      }

      return { message: 'email verified can now log in' };
    } catch (error) {
      throw new NotFoundException('invalid token');
    }
  }

  async sendEmail(email: string, name: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('EMAIL_USERNAME'),
        pass: this.config.get<string>('APP_PASSWORD'),
      },
    });

    const url = this.getUrl();

    const mailConfigurations = {
      from: this.config.get<string>('EMAIL_USERNAME'),

      to: email,

      subject: 'Email Verification',

      // This would be the text of email body
      text: `Hi! ${name}, You have recently visited 
           our website and entered your email.
           Please follow the given link to verify your email,
           link expires in 10 hours 
           ${url}${token} 
           Thanks`,
    };

    transporter.sendMail(mailConfigurations, function (error, info) {
      if (error) throw Error(error);
      return true;
    });
  }

  private getUrl() {
    switch (this.config.get<string>('NODE_ENV')) {
      case 'production':
        return 'https://chitchat-0vhe.onrender.com/api/v1/users/verify?token=';
      case 'development':
        return 'http://localhost:3000/api/v1/users/verify?token=';

      default:
        throw new Error('no environment defined');
    }
  }

  async sendVerification(email: string): Promise<any> {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new NotFoundException('email does not exist, sign up');
    if (user.verified) {
      throw new BadRequestException('user already verified');
    }

    const token = await this.authService.verify(user._id);
    this.sendEmail(user.email, user.nickname, token.access_token);
    return true;
  }

  async isOnline(id: string, isOnline: boolean): Promise<any> {
    try {
      await this.userModel
        .findOneAndUpdate(
          { _id: id },
          { $set: { online: isOnline } },
          { new: true },
        )
        .exec();

      return { message: 'updated' };
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}

import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { group } from 'src/common/constants';
import { Room } from './models/room.model';
import { Model } from 'mongoose';
import { PaginationDTO } from 'src/common/pagination-dto';
import { CreateRoomDTO } from './dto/create-room.dto';
import { UpdateRoomDTO } from './dto/update.room.dto';
import { FileService } from '../file/file.service';
import { AuthService } from 'src/auth/auth.service';
import { getToken } from 'src/common/gettoken';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(group) private readonly roomModel: Model<Room>,
    private readonly fileService: FileService,
    private readonly authService: AuthService,
  ) {}
  async findAll(paginationQuery: PaginationDTO): Promise<Room[]> {
    const { skip, limit } = paginationQuery;

    return this.roomModel.find().skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<Room> {
    try {
      const room = await this.roomModel.findOne({ _id: id }, { __v: 0 }).exec();
      if (room) return room;
      throw new NotFoundException('Room with that ID not found');
    } catch (error) {
      throw new NotFoundException('Room with that ID not found');
    }
  }
  async findByName(name: string): Promise<Room> {
    try {
      const room = await this.roomModel
        .findOne({ name: name.toLowerCase() }, { __v: 0 })
        .exec();
      if (room) return room;
      throw new NotFoundException('Room with that name not found');
    } catch (error) {
      throw new NotFoundException('Room with that name not found');
    }
  }

  async createRoom(
    createRoom: CreateRoomDTO,
    auth: string,
    file?: Express.Multer.File,
  ): Promise<Room> {
    createRoom.name = createRoom.name.toLowerCase();
    const roomExist = await this.roomModel.findOne({
      name: createRoom.name.toLowerCase(),
    });
    if (roomExist) {
      throw new BadGatewayException('Room with that name already exist');
    }
    const payload = await this.authService.extract(getToken(auth));
    let result;

    const room = await new this.roomModel({
      ...createRoom,
      createdBy: payload.id,
    });

    if (file) {
      result = await this.fileService.uploadImage(file);
      room.avatar = result.imageURL;
    }

    return room.save();
  }

  async updateRoom(
    id: string,
    updateGroup: UpdateRoomDTO,
    file?: Express.Multer.File,
  ): Promise<Room> {
    try {
      let result;
      if (file) {
        result = await this.fileService.uploadImage(file);
      }
      const group = await this.roomModel
        .findOneAndUpdate(
          { _id: id },
          { $set: updateGroup, avatar: result?.imageURL },
          { new: true },
        )
        .exec();
      if (group) return group;
      throw new NotFoundException('Room with ID not found');
    } catch (error) {
      throw new NotFoundException('Room with ID not found');
    }
  }
}

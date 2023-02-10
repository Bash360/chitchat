import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { defaultGroupAvatarURI } from '../../common/constants';
import { User } from 'src/user/models/user.model';

@Schema({ strict: true, timestamps: true })
export class Room extends mongoose.Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  topic: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' })
  createdBy: User;

  @Prop({ default: defaultGroupAvatarURI })
  avatar: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

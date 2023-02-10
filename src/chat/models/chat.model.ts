import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/user/models/user.model';
import { Group } from 'src/group/models/group.model';

@Schema({ strict: true, timestamps: true })
export class Chat extends mongoose.Document {
  @Prop({ type: User, required: true, ref: 'User' })
  sender: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Group' })
  groupID: Group;

  @Prop({ required: true })
  text: string;

  @Prop()
  videoUrl: string;

  @Prop()
  documentUrl: string;

  @Prop()
  imageUrl: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

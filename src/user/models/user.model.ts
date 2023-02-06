import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { defaultAvatarURI } from '../../common/constants';
@Schema({ strict: true })
export class User extends Document {
  @Prop({ required: true })
  nickname: string;
  @Prop({
    default: defaultAvatarURI,
  })
  avatar: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

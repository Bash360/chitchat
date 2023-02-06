import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ strict: true })
export class user extends Document {
  @Prop({ required: true })
  nickname: string;
  @Prop({ default: '' })
  avatar: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
}

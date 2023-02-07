import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { chat } from 'src/common/constants';
import { ChatSchema } from './models/chat.model';
import { UserModule } from 'src/user/user.module';
import { GroupModule } from 'src/group/group.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: chat, schema: ChatSchema }]),
    UserModule,
    GroupModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

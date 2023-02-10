import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { chat } from 'src/common/constants';
import { ChatSchema } from './models/chat.model';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: chat, schema: ChatSchema }]),
    UserModule,
    forwardRef(() => RoomModule),
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}

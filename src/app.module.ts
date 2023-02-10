import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    RoomModule,
    ChatModule,
    FileModule,
    AuthModule,
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

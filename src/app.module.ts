import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { ChatModule } from './chat/chat.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    GroupModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

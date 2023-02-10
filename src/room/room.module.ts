import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { group } from '../common/constants';
import { RoomSchema } from './models/room.model';
import { UserModule } from 'src/user/user.module';
import { FileModule } from '../file/file.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: group, schema: RoomSchema }]),
    UserModule,
    FileModule,
    AuthModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}

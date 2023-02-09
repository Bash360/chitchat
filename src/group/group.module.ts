import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { MongooseModule } from '@nestjs/mongoose';
import { group } from '../common/constants';
import { GroupSchema } from './models/group.model';
import { UserModule } from 'src/user/user.module';
import { FileModule } from '../file/file.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: group, schema: GroupSchema }]),
    UserModule,
    FileModule,
    AuthModule,
  ],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService],
})
export class GroupModule {}

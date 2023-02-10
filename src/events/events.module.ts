import { Module, forwardRef } from '@nestjs/common';
import { EventsGateway } from './events-gateway';
import { ChatModule } from 'src/chat/chat.module';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';

@Module({
  imports: [ChatModule, UserModule, RoomModule],
  providers: [EventsGateway],
})
export class EventsModule {}

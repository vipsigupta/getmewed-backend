import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { WebsocketModule } from './websocket/websocket.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ThrottlerModule } from '@nestjs/throttler';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { SpaceModule } from './modules/space/space.module';
import { GuestModule } from './modules/guest/guest.module';
import { EventModule } from './modules/event/event.module';
import { FeedModule } from './modules/feed/feed.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PerformanceModule } from './modules/performance/performance.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,       // Global DB access
    FirebaseModule,     // Global Firebase Admin + FCM
    WebsocketModule,
    AuthModule,
    SpaceModule,
    GuestModule,
    EventModule,
    FeedModule,
    NotificationModule,
    PerformanceModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

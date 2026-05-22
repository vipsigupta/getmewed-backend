import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebsocketModule } from '../../websocket/websocket.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [PrismaModule, WebsocketModule, NotificationModule],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {}

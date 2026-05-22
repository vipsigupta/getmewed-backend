import { Module } from '@nestjs/common';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';
import { SessionController } from './session.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GuestController, SessionController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}

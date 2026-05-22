import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationService, BroadcastDto } from './notification.service';
import { RegisterDeviceDto, RemoveDeviceDto } from './dto/device.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@UseGuards(FirebaseAuthGuard, ThrottlerGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ── Device Registration ─────────────────────────────────────────

  @Post('devices/register')
  registerDevice(@Body() dto: RegisterDeviceDto) {
    return this.notificationService.registerDevice(dto);
  }

  @Delete('devices/remove')
  removeDevice(@Body() dto: RemoveDeviceDto) {
    return this.notificationService.removeDevice(dto);
  }

  @Get('devices/:guestId')
  getGuestDevices(@Param('guestId') guestId: string) {
    return this.notificationService.getGuestDevices(guestId);
  }

  // ── Admin Broadcast ─────────────────────────────────────────────

  // Admin sends a custom push to all guests in a space
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 broadcasts per minute max
  @Post('broadcast')
  broadcast(@Body() dto: BroadcastDto) {
    return this.notificationService.broadcast(dto);
  }
}

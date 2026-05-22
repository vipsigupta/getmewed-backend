import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { NotificationTemplates } from '../../firebase/notification.templates';
import { RegisterDeviceDto, RemoveDeviceDto } from './dto/device.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class BroadcastDto {
  @IsString() @IsNotEmpty() spaceId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() body: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseService,
  ) {}

  // -----------------------------------------------------------------
  // DEVICE REGISTRATION
  // -----------------------------------------------------------------

  async registerDevice(dto: RegisterDeviceDto) {
    const guest = await this.prisma.guest.findUnique({ where: { id: dto.guestId } });
    if (!guest) throw new NotFoundException('Guest not found');

    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      update: { guestId: dto.guestId, deviceType: dto.deviceType },
      create: { token: dto.token, deviceType: dto.deviceType, guestId: dto.guestId },
    });
  }

  async removeDevice(dto: RemoveDeviceDto) {
    await this.prisma.deviceToken.deleteMany({ where: { token: dto.token } });
    return { removed: true, token: dto.token };
  }

  async getGuestDevices(guestId: string) {
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Guest not found');
    return this.prisma.deviceToken.findMany({ where: { guestId }, orderBy: { createdAt: 'desc' } });
  }

  // -----------------------------------------------------------------
  // FCM TOKEN HELPERS
  // -----------------------------------------------------------------

  /** ALL guests in a space — use only for admin broadcasts */
  async getSpaceTokens(spaceId: string): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { guest: { spaceId } },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  /** Only guests who confirmed (YES) or are considering (MAYBE) — use for event/performance notifications */
  async getActiveGuestTokens(spaceId: string): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: {
        guest: {
          spaceId,
          attendance: { in: ['YES', 'MAYBE'] },
        },
      },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  /** Only admin guests in a space */
  async getAdminTokens(spaceId: string): Promise<string[]> {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { guest: { spaceId, isAdmin: true } },
      select: { token: true },
    });
    return tokens.map((t) => t.token);
  }

  // -----------------------------------------------------------------
  // PUSH NOTIFICATION TRIGGERS (called by Event/Performance/Space services)
  // -----------------------------------------------------------------

  async notifyEventLive(spaceId: string, eventTitle: string, venue?: string) {
    // Only guests who confirmed or are considering — not PENDING/NO
    const tokens = await this.getActiveGuestTokens(spaceId);
    const { title, body } = NotificationTemplates.eventLive(eventTitle, venue);
    await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'EVENT_LIVE' });
    await this.persistNotification(spaceId, title, body, 'EVENT_LIVE');
  }

  async notifyPerformanceLive(spaceId: string, performers: string, songName?: string) {
    // Only guests who confirmed or are considering
    const tokens = await this.getActiveGuestTokens(spaceId);
    const { title, body } = NotificationTemplates.performanceLive(performers, songName);
    await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'PERFORMANCE_LIVE' });
    await this.persistNotification(spaceId, title, body, 'PERFORMANCE_LIVE');
  }

  async notifyGuestArrived(spaceId: string, guestName: string, relation: string) {
    // Only admins get arrival pings — reduces noise for regular guests
    const tokens = await this.getAdminTokens(spaceId);
    const { title, body } = NotificationTemplates.guestArrived(guestName, relation);
    await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'GUEST_ARRIVED' });
  }

  async notifySpaceLive(spaceId: string, spaceName: string) {
    // Space going LIVE — notify everyone including PENDING (they should know!)
    const tokens = await this.getSpaceTokens(spaceId);
    const { title, body } = NotificationTemplates.spaceLive(spaceName);
    await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'SPACE_LIVE' });
    await this.persistNotification(spaceId, title, body, 'SPACE_LIVE');
  }

  async broadcast(dto: BroadcastDto) {
    const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
    if (!space) throw new NotFoundException('Space not found');

    // Admin broadcast overrides — sends to ALL guests in the space
    const tokens = await this.getSpaceTokens(dto.spaceId);
    await this.firebase.sendMulticast(tokens, dto.title, dto.body, {
      spaceId: dto.spaceId,
      type: 'BROADCAST',
    });
    await this.persistNotification(dto.spaceId, dto.title, dto.body, 'BROADCAST');
    return { sent: tokens.length, title: dto.title };
  }

  // -----------------------------------------------------------------
  // PERSIST NOTIFICATION (for notification history)
  // -----------------------------------------------------------------

  private async persistNotification(spaceId: string, title: string, body: string, type: string) {
    // Persist to all guests in the space for notification history
    const guests = await this.prisma.guest.findMany({
      where: { spaceId },
      select: { id: true },
    });

    if (guests.length === 0) return;

    await this.prisma.notification.createMany({
      data: guests.map((g) => ({
        title,
        body,
        type,
        spaceId,
        guestId: g.id,
      })),
      skipDuplicates: true,
    });
  }
}

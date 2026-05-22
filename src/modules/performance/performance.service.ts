import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { NotificationService } from '../notification/notification.service';
import {
  CreatePerformanceDto,
  UpdatePerformanceStatusDto,
  ReorderPerformanceDto,
} from './dto/performance.dto';
import { FeedPostType, PerformanceStatus } from '@prisma/client';

@Injectable()
export class PerformanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: EventsGateway,
    private readonly notifications: NotificationService,
  ) {}

  async create(dto: CreatePerformanceDto) {
    const performance = await this.prisma.performance.create({
      data: {
        title: dto.title,
        performers: dto.performers,
        songName: dto.songName,
        sequence: dto.sequence,
        spaceId: dto.spaceId,
        eventId: dto.eventId || null,
      },
    });

    // Broadcast updated queue
    await this.broadcastQueue(dto.spaceId);
    return performance;
  }

  async getQueue(spaceId: string) {
    return this.prisma.performance.findMany({
      where: { spaceId, status: { not: PerformanceStatus.COMPLETED } },
      orderBy: { sequence: 'asc' },
    });
  }

  async updateStatus(id: string, dto: UpdatePerformanceStatusDto) {
    const performance = await this.prisma.performance.update({
      where: { id },
      data: { status: dto.status },
    });

    // Broadcast updated queue to all phones
    await this.broadcastQueue(performance.spaceId);

    if (dto.status === PerformanceStatus.LIVE) {
      // Full cinematic takeover on big screen
      this.gateway.broadcastToBigScreen(performance.spaceId, 'bigscreen:now_performing', {
        id: performance.id,
        title: performance.title,
        performers: performance.performers,
        songName: performance.songName,
      });

      // Emit dedicated LIVE event to all phones
      this.gateway.broadcastToSpace(performance.spaceId, 'server:performance_live', performance);

      // FCM push to all guests
      await this.notifications.notifyPerformanceLive(
        performance.spaceId,
        performance.performers,
        performance.songName ?? undefined,
      );

      // Auto-inject a PERFORMANCE card into the live feed
      const adminGuestId = await this.getFirstAdminGuestId(performance.spaceId);
      await this.prisma.feedPost.create({
        data: {
          type: FeedPostType.PERFORMANCE,
          content: `🎤 ${performance.performers} performing "${performance.songName || performance.title}" LIVE right now!`,
          spaceId: performance.spaceId,
          guestId: adminGuestId,
          eventId: performance.eventId || null,
        },
      });
    }

    return performance;
  }

  async reorder(spaceId: string, dto: ReorderPerformanceDto) {
    await this.prisma.performance.update({
      where: { id: dto.performanceId },
      data: { sequence: dto.newSequence },
    });

    // Broadcast the new order immediately
    const queue = await this.broadcastQueue(spaceId);
    return queue;
  }

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------

  private async broadcastQueue(spaceId: string) {
    const queue = await this.getQueue(spaceId);
    this.gateway.broadcastToSpace(spaceId, 'server:queue_updated', queue);
    return queue;
  }

  private async getFirstAdminGuestId(spaceId: string): Promise<string> {
    const admin = await this.prisma.guest.findFirst({
      where: { spaceId, isAdmin: true },
    });
    if (admin) return admin.id;
    const fallback = await this.prisma.guest.findFirst({ where: { spaceId } });
    if (!fallback) throw new NotFoundException('No guests in space');
    return fallback.id;
  }
}

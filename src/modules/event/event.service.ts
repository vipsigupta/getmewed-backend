import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { NotificationService } from '../notification/notification.service';
import { CreateEventDto, UpdateEventStatusDto, MarkArrivalDto } from './dto/event.dto';
import { EventStatus, FeedPostType } from '@prisma/client';

@Injectable()
export class EventService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway: EventsGateway | undefined,
    private readonly notifications: NotificationService,
  ) {}

  // -----------------------------------------------------------------
  // EVENTS (Itinerary)
  // -----------------------------------------------------------------

  async createEvent(dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        venue: dto.venue,
        startTime: new Date(dto.startTime),
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
        spaceId: dto.spaceId,
      },
    });
    return event;
  }

  async getEvents(spaceId: string) {
    return this.prisma.event.findMany({
      where: { spaceId },
      orderBy: { startTime: 'asc' },
      include: {
        _count: { select: { performances: true } },
      },
    });
  }

  async updateEventStatus(id: string, dto: UpdateEventStatusDto) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { status: dto.status },
    });

    // Socket broadcast (if WebSocket is available)
    this.gateway?.broadcastToSpace(event.spaceId, 'server:event_live', event);

    if (dto.status === EventStatus.LIVE) {
      // Big screen takeover
      this.gateway?.broadcastToBigScreen(event.spaceId, 'bigscreen:flash_announcement', {
        title: `${event.title} is now LIVE!`,
        venue: event.venue,
      });

      // FCM push to all guests
      await this.notifications.notifyEventLive(event.spaceId, event.title, event.venue ?? undefined);

      // Auto-inject a SYSTEM feed post
      await this.prisma.feedPost.create({
        data: {
          type: FeedPostType.SYSTEM,
          content: `🎉 ${event.title} has started${event.venue ? ` at ${event.venue}` : ''}!`,
          spaceId: event.spaceId,
          guestId: await this.getFirstAdminGuestId(event.spaceId),
          eventId: id,
        },
      });
    }

    return event;
  }

  // -----------------------------------------------------------------
  // GUEST ARRIVAL
  // -----------------------------------------------------------------

  async markArrival(dto: MarkArrivalDto) {
    const guest = await this.prisma.guest.update({
      where: { id: dto.guestId },
      data: { hasArrived: true, attendance: 'YES' },
      include: {
        user: { select: { phone: true } },
      },
    });

    // Socket: arrival card on all phones + big screen (if WebSocket is available)
    this.gateway?.broadcastToSpace(guest.spaceId, 'server:guest_arrived', {
      guestId: guest.id,
      name: guest.name,
      group: guest.group,
      relation: guest.relation,
      profileUrl: guest.profileUrl,
    });
    this.gateway?.broadcastToBigScreen(guest.spaceId, 'bigscreen:flash_arrival', {
      name: guest.name,
      group: guest.group,
      profileUrl: guest.profileUrl,
    });

    // FCM push to admins only
    await this.notifications.notifyGuestArrived(guest.spaceId, guest.name, guest.relation);

    // Auto-inject ARRIVAL feed card
    await this.prisma.feedPost.create({
      data: {
        type: FeedPostType.ARRIVAL,
        content: `✨ ${guest.name} (${guest.relation}) just arrived at the celebration!`,
        spaceId: guest.spaceId,
        guestId: guest.id,
      },
    });

    return guest;
  }

  // -----------------------------------------------------------------
  // HELPERS
  // -----------------------------------------------------------------

  private async getFirstAdminGuestId(spaceId: string): Promise<string> {
    const admin = await this.prisma.guest.findFirst({
      where: { spaceId, isAdmin: true },
    });
    if (!admin) {
      // Fallback to any guest
      const fallback = await this.prisma.guest.findFirst({ where: { spaceId } });
      if (!fallback) throw new NotFoundException('No guests found in space');
      return fallback.id;
    }
    return admin.id;
  }
}

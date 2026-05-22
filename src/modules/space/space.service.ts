import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventsGateway } from '../../websocket/events.gateway';
import { CreateSpaceDto, UpdateSpaceStatusDto } from './dto/space.dto';
import { SpaceStatus } from '@prisma/client';

// Short alphanumeric invite code generator
function generateInviteCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${suffix}`;
}

@Injectable()
export class SpaceService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly gateway?: EventsGateway,
  ) {}

  async createSpace(dto: CreateSpaceDto) {
    const space = await this.prisma.space.create({
      data: {
        name: dto.name,
        theme: dto.theme,
        coverUrl: dto.coverUrl,
        date: new Date(dto.date),
        inviteCode: generateInviteCode(dto.name),
      },
    });
    return space;
  }

  async getSpace(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: {
        events: { orderBy: { startTime: 'asc' } },
        _count: { select: { guests: true, feedPosts: true } },
      },
    });
    if (!space) throw new NotFoundException('Space not found');
    return space;
  }

  async updateStatus(id: string, dto: UpdateSpaceStatusDto) {
    const space = await this.prisma.space.update({
      where: { id },
      data: { status: dto.status },
    });

    // Broadcast the live status change to all connected guests (if WebSocket is available)
    this.gateway?.broadcastToSpace(id, 'server:space_status_updated', {
      spaceId: id,
      status: dto.status,
    });

    if (dto.status === SpaceStatus.LIVE) {
      this.gateway?.broadcastToBigScreen(id, 'bigscreen:flash_announcement', {
        title: `${space.name} is now LIVE!`,
      });
    }

    return space;
  }

  async getGuests(spaceId: string) {
    return this.prisma.guest.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { phone: true } } },
    });
  }
}

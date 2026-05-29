import { Injectable, NotFoundException } from '@nestjs/common';
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

// Parse string time like "10:00 AM" or "07:00 PM" with base date
function parseTimeWithBaseDate(baseDateStr: string, timeStr: string): Date {
  const date = new Date(baseDateStr);
  if (!timeStr) return date;

  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return date;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  date.setUTCHours(hours, minutes, 0, 0);
  return date;
}

function enrichSpace(space: any) {
  if (!space) return space;
  let parsedTheme: any = {};
  try {
    if (space.theme) {
      parsedTheme = JSON.parse(space.theme);
    }
  } catch (e) {
    parsedTheme = { welcomeMessage: space.theme };
  }

  const keyPeopleObj = parsedTheme.keyPeople || {};
  return {
    ...space,
    welcomeMessage: parsedTheme.welcomeMessage || '',
    venue: parsedTheme.venue || space.venue || '',
    locationLink: parsedTheme.locationLink || '',
    dressCode: parsedTheme.dressCode || '',
    mealOptions: parsedTheme.mealOptions || '',
    keyPeople: keyPeopleObj,
    religion: keyPeopleObj.religion || 'HINDU',
  };
}

@Injectable()
export class SpaceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: EventsGateway,
  ) {}

  async createSpace(userId: string, dto: CreateSpaceDto) {
    const inviteCode = generateInviteCode(dto.name);
    
    let kpObj: any = {};
    try {
      if (dto.keyPeople) {
        kpObj = JSON.parse(dto.keyPeople);
      }
    } catch (_) {}

    // Store extra fields (venue, keyPeople) elegantly in the theme/meta JSON or fields
    const parsedTheme = JSON.stringify({
      welcomeMessage: dto.theme || 'We are excited to celebrate with you!',
      venue: dto.venue || '',
      locationLink: dto.locationLink || kpObj.locationLink || '',
      dressCode: kpObj.dressCode || '',
      mealOptions: kpObj.mealOptions || '',
      keyPeople: kpObj,
    });

    const spaceResult = await this.prisma.$transaction(async (tx) => {
      // 1. Create main Celebration Space
      const space = await tx.space.create({
        data: {
          name: dto.name,
          theme: parsedTheme,
          coverUrl: dto.coverUrl,
          date: new Date(dto.date),
          inviteCode,
          eventType: dto.eventType,
        },
      });

      // 2. Create the creator as Host admin guest
      await tx.guest.create({
        data: {
          name: 'Host',
          group: 'HOST',
          relation: 'Host',
          isAdmin: true,
          userId,
          spaceId: space.id,
        },
      });

      // 3. Create Timeline Events (Morning, Afternoon, Evening) if provided
      if (dto.timeline && dto.timeline.length > 0) {
        for (const prog of dto.timeline) {
          if (prog.title) {
            const startTime = parseTimeWithBaseDate(dto.date, prog.time);
            
            const eventDesc = JSON.stringify({
              period: prog.period,
              dressCode: prog.dressCode || '',
              mealOptions: prog.mealOptions || '',
            });

            await tx.event.create({
              data: {
                title: prog.title,
                description: eventDesc,
                venue: prog.venue || dto.venue || 'Main Venue',
                startTime,
                spaceId: space.id,
              },
            });
          }
        }
      }

      return space;
    });

    return enrichSpace(spaceResult);
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
    return enrichSpace(space);
  }

  async getSpaceByInviteCode(inviteCode: string) {
    const space = await this.prisma.space.findUnique({
      where: { inviteCode },
      include: {
        events: { orderBy: { startTime: 'asc' } },
        _count: { select: { guests: true, feedPosts: true } },
      },
    });
    if (!space) throw new NotFoundException('Invalid or expired invite code');
    return enrichSpace(space);
  }

  async updateStatus(id: string, dto: UpdateSpaceStatusDto) {
    const space = await this.prisma.space.update({
      where: { id },
      data: { status: dto.status },
    });

    // Broadcast the live status change to all connected guests
    this.gateway.broadcastToSpace(id, 'server:space_status_updated', {
      spaceId: id,
      status: dto.status,
    });

    if (dto.status === SpaceStatus.LIVE) {
      this.gateway.broadcastToBigScreen(id, 'bigscreen:flash_announcement', {
        title: `${space.name} is now LIVE! 🎉`,
      });
    }

    return enrichSpace(space);
  }

  async getGuests(spaceId: string) {
    return this.prisma.guest.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { phone: true } } },
    });
  }
}

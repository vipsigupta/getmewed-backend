import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JoinSpaceDto, UpdateParticipationDto } from './dto/participation.dto';

@Injectable()
export class GuestService {
  constructor(private readonly prisma: PrismaService) {}

  // -----------------------------------------------------------------
  // JOIN SPACE — the core onboarding step
  // -----------------------------------------------------------------

  async joinSpace(userId: string, dto: JoinSpaceDto) {
    // 1. Find space by invite code
    const space = await this.prisma.space.findUnique({
      where: { inviteCode: dto.inviteCode },
    });
    if (!space) throw new NotFoundException('Invalid invite code. Please check your invitation link.');

    // 2. Prevent duplicate participation (idempotent — return existing guest record)
    const existing = await this.prisma.guest.findUnique({
      where: { userId_spaceId: { userId, spaceId: space.id } },
    });
    if (existing) return existing;

    // 3. Create the participation record with full RSVP data from the onboarding funnel
    const guest = await this.prisma.guest.create({
      data: {
        name: dto.name,
        group: dto.group || 'GUEST',
        relation: dto.relation || 'Guest',
        attendance: dto.attendance || 'PENDING',
        profileUrl: dto.profileUrl,
        userId,
        spaceId: space.id,
      },
      include: {
        space: { select: { id: true, name: true, theme: true, status: true, date: true } },
        user:  { select: { phone: true } },
      },
    });

    return guest;
  }

  // -----------------------------------------------------------------
  // UPDATE PARTICIPATION — relation, side, attendance
  // -----------------------------------------------------------------

  async updateParticipation(guestId: string, dto: UpdateParticipationDto) {
    const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new NotFoundException('Guest record not found');

    return this.prisma.guest.update({
      where: { id: guestId },
      data: {
        ...(dto.name       && { name: dto.name }),
        ...(dto.group      && { group: dto.group }),
        ...(dto.relation   && { relation: dto.relation }),
        ...(dto.attendance && { attendance: dto.attendance }),
        ...(dto.profileUrl && { profileUrl: dto.profileUrl }),
      },
      include: {
        space: { select: { id: true, name: true } },
      },
    });
  }

  // -----------------------------------------------------------------
  // LEAVE SPACE — remove participation
  // -----------------------------------------------------------------

  async leaveSpace(userId: string, spaceId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });
    if (!guest) throw new NotFoundException('You are not a participant in this space');

    await this.prisma.guest.delete({ where: { id: guest.id } });
    return { left: true, spaceId };
  }

  // -----------------------------------------------------------------
  // SESSION HYDRATION — the frontend boot call
  // Returns user + all joined spaces + guest profile + active events
  // -----------------------------------------------------------------

  async getSessionMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        guests: {
          include: {
            space: {
              include: {
                events: {
                  where: { status: { in: ['UPCOMING', 'LIVE'] } },
                  orderBy: { startTime: 'asc' },
                  take: 3,
                },
                _count: { select: { guests: true, feedPosts: true } },
              },
            },
            deviceTokens: { select: { id: true, deviceType: true, createdAt: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User session not found');

    // Shape the response for frontend consumption
    return {
      id: user.id,
      phone: user.phone,
      participations: user.guests.map((g) => ({
        guestId:    g.id,
        name:       g.name,
        group:      g.group,
        relation:   g.relation,
        attendance: g.attendance,
        hasArrived: g.hasArrived,
        isAdmin:    g.isAdmin,
        profileUrl: g.profileUrl,
        space:      g.space,
        devices:    g.deviceTokens,
      })),
    };
  }

  // -----------------------------------------------------------------
  // FETCH SINGLE GUEST
  // -----------------------------------------------------------------

  async getGuest(guestId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        space: { select: { id: true, name: true, status: true } },
        user:  { select: { phone: true } },
      },
    });
    if (!guest) throw new NotFoundException('Guest not found');
    return guest;
  }

  // -----------------------------------------------------------------
  // CHECK MEMBERSHIP — lightweight check for the join funnel
  // Returns whether the current user is already a guest in a space.
  // Used by mobile to skip the onboarding funnel for known guests.
  // -----------------------------------------------------------------

  async checkMembership(userId: string, spaceId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
      select: { id: true, group: true, attendance: true, relation: true },
    });
    return {
      isMember: !!guest,
      guestId:   guest?.id,
      group:     guest?.group,
      attendance: guest?.attendance,
      relation:  guest?.relation,
    };
  }
}

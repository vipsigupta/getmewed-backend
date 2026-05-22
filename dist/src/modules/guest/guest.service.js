"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GuestService = class GuestService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async joinSpace(userId, dto) {
        const space = await this.prisma.space.findUnique({
            where: { inviteCode: dto.inviteCode },
        });
        if (!space)
            throw new common_1.NotFoundException('Invalid invite code. Please check your invitation link.');
        const existing = await this.prisma.guest.findUnique({
            where: { userId_spaceId: { userId, spaceId: space.id } },
        });
        if (existing)
            return existing;
        const guest = await this.prisma.guest.create({
            data: {
                name: dto.name,
                group: dto.group || 'GUEST',
                relation: dto.relation || 'Guest',
                profileUrl: dto.profileUrl,
                userId,
                spaceId: space.id,
            },
            include: {
                space: { select: { id: true, name: true, theme: true, status: true, date: true } },
                user: { select: { phone: true } },
            },
        });
        return guest;
    }
    async updateParticipation(guestId, dto) {
        const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest)
            throw new common_1.NotFoundException('Guest record not found');
        return this.prisma.guest.update({
            where: { id: guestId },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.group && { group: dto.group }),
                ...(dto.relation && { relation: dto.relation }),
                ...(dto.attendance && { attendance: dto.attendance }),
                ...(dto.profileUrl && { profileUrl: dto.profileUrl }),
            },
            include: {
                space: { select: { id: true, name: true } },
            },
        });
    }
    async leaveSpace(userId, spaceId) {
        const guest = await this.prisma.guest.findUnique({
            where: { userId_spaceId: { userId, spaceId } },
        });
        if (!guest)
            throw new common_1.NotFoundException('You are not a participant in this space');
        await this.prisma.guest.delete({ where: { id: guest.id } });
        return { left: true, spaceId };
    }
    async getSessionMe(userId) {
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
        if (!user)
            throw new common_1.NotFoundException('User session not found');
        return {
            id: user.id,
            phone: user.phone,
            participations: user.guests.map((g) => ({
                guestId: g.id,
                name: g.name,
                group: g.group,
                relation: g.relation,
                attendance: g.attendance,
                hasArrived: g.hasArrived,
                isAdmin: g.isAdmin,
                profileUrl: g.profileUrl,
                space: g.space,
                devices: g.deviceTokens,
            })),
        };
    }
    async getGuest(guestId) {
        const guest = await this.prisma.guest.findUnique({
            where: { id: guestId },
            include: {
                space: { select: { id: true, name: true, status: true } },
                user: { select: { phone: true } },
            },
        });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return guest;
    }
};
exports.GuestService = GuestService;
exports.GuestService = GuestService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GuestService);
//# sourceMappingURL=guest.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
let EventService = class EventService {
    constructor(prisma, gateway, notifications) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.notifications = notifications;
    }
    async createEvent(dto) {
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
    async getEvents(spaceId) {
        return this.prisma.event.findMany({
            where: { spaceId },
            orderBy: { startTime: 'asc' },
            include: {
                _count: { select: { performances: true } },
            },
        });
    }
    async updateEventStatus(id, dto) {
        const event = await this.prisma.event.update({
            where: { id },
            data: { status: dto.status },
        });
        this.gateway?.broadcastToSpace(event.spaceId, 'server:event_live', event);
        if (dto.status === client_1.EventStatus.LIVE) {
            this.gateway?.broadcastToBigScreen(event.spaceId, 'bigscreen:flash_announcement', {
                title: `${event.title} is now LIVE!`,
                venue: event.venue,
            });
            await this.notifications.notifyEventLive(event.spaceId, event.title, event.venue ?? undefined);
            await this.prisma.feedPost.create({
                data: {
                    type: client_1.FeedPostType.SYSTEM,
                    content: `🎉 ${event.title} has started${event.venue ? ` at ${event.venue}` : ''}!`,
                    spaceId: event.spaceId,
                    guestId: await this.getFirstAdminGuestId(event.spaceId),
                    eventId: id,
                },
            });
        }
        return event;
    }
    async markArrival(dto) {
        const guest = await this.prisma.guest.update({
            where: { id: dto.guestId },
            data: { hasArrived: true, attendance: 'YES' },
            include: {
                user: { select: { phone: true } },
            },
        });
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
        await this.notifications.notifyGuestArrived(guest.spaceId, guest.name, guest.relation);
        await this.prisma.feedPost.create({
            data: {
                type: client_1.FeedPostType.ARRIVAL,
                content: `✨ ${guest.name} (${guest.relation}) just arrived at the celebration!`,
                spaceId: guest.spaceId,
                guestId: guest.id,
            },
        });
        return guest;
    }
    async getFirstAdminGuestId(spaceId) {
        const admin = await this.prisma.guest.findFirst({
            where: { spaceId, isAdmin: true },
        });
        if (!admin) {
            const fallback = await this.prisma.guest.findFirst({ where: { spaceId } });
            if (!fallback)
                throw new common_1.NotFoundException('No guests found in space');
            return fallback.id;
        }
        return admin.id;
    }
};
exports.EventService = EventService;
exports.EventService = EventService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, notification_service_1.NotificationService])
], EventService);
//# sourceMappingURL=event.service.js.map
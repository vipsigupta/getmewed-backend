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
exports.PerformanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const client_1 = require("@prisma/client");
let PerformanceService = class PerformanceService {
    constructor(prisma, gateway, notifications) {
        this.prisma = prisma;
        this.gateway = gateway;
        this.notifications = notifications;
    }
    async create(dto) {
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
        await this.broadcastQueue(dto.spaceId);
        return performance;
    }
    async getQueue(spaceId) {
        return this.prisma.performance.findMany({
            where: { spaceId, status: { not: client_1.PerformanceStatus.COMPLETED } },
            orderBy: { sequence: 'asc' },
        });
    }
    async updateStatus(id, dto) {
        const performance = await this.prisma.performance.update({
            where: { id },
            data: { status: dto.status },
        });
        await this.broadcastQueue(performance.spaceId);
        if (dto.status === client_1.PerformanceStatus.LIVE) {
            this.gateway?.broadcastToBigScreen(performance.spaceId, 'bigscreen:now_performing', {
                id: performance.id,
                title: performance.title,
                performers: performance.performers,
                songName: performance.songName,
            });
            this.gateway?.broadcastToSpace(performance.spaceId, 'server:performance_live', performance);
            await this.notifications.notifyPerformanceLive(performance.spaceId, performance.performers, performance.songName ?? undefined);
            const adminGuestId = await this.getFirstAdminGuestId(performance.spaceId);
            await this.prisma.feedPost.create({
                data: {
                    type: client_1.FeedPostType.PERFORMANCE,
                    content: `🎤 ${performance.performers} performing "${performance.songName || performance.title}" LIVE right now!`,
                    spaceId: performance.spaceId,
                    guestId: adminGuestId,
                    eventId: performance.eventId || null,
                },
            });
        }
        return performance;
    }
    async reorder(spaceId, dto) {
        await this.prisma.performance.update({
            where: { id: dto.performanceId },
            data: { sequence: dto.newSequence },
        });
        const queue = await this.broadcastQueue(spaceId);
        return queue;
    }
    async broadcastQueue(spaceId) {
        const queue = await this.getQueue(spaceId);
        this.gateway?.broadcastToSpace(spaceId, 'server:queue_updated', queue);
        return queue;
    }
    async getFirstAdminGuestId(spaceId) {
        const admin = await this.prisma.guest.findFirst({
            where: { spaceId, isAdmin: true },
        });
        if (admin)
            return admin.id;
        const fallback = await this.prisma.guest.findFirst({ where: { spaceId } });
        if (!fallback)
            throw new common_1.NotFoundException('No guests in space');
        return fallback.id;
    }
};
exports.PerformanceService = PerformanceService;
exports.PerformanceService = PerformanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, notification_service_1.NotificationService])
], PerformanceService);
//# sourceMappingURL=performance.service.js.map
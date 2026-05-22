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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.BroadcastDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const firebase_service_1 = require("../../firebase/firebase.service");
const notification_templates_1 = require("../../firebase/notification.templates");
const class_validator_1 = require("class-validator");
class BroadcastDto {
}
exports.BroadcastDto = BroadcastDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "spaceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BroadcastDto.prototype, "body", void 0);
let NotificationService = NotificationService_1 = class NotificationService {
    constructor(prisma, firebase) {
        this.prisma = prisma;
        this.firebase = firebase;
        this.logger = new common_1.Logger(NotificationService_1.name);
    }
    async registerDevice(dto) {
        const guest = await this.prisma.guest.findUnique({ where: { id: dto.guestId } });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return this.prisma.deviceToken.upsert({
            where: { token: dto.token },
            update: { guestId: dto.guestId, deviceType: dto.deviceType },
            create: { token: dto.token, deviceType: dto.deviceType, guestId: dto.guestId },
        });
    }
    async removeDevice(dto) {
        await this.prisma.deviceToken.deleteMany({ where: { token: dto.token } });
        return { removed: true, token: dto.token };
    }
    async getGuestDevices(guestId) {
        const guest = await this.prisma.guest.findUnique({ where: { id: guestId } });
        if (!guest)
            throw new common_1.NotFoundException('Guest not found');
        return this.prisma.deviceToken.findMany({ where: { guestId }, orderBy: { createdAt: 'desc' } });
    }
    async getSpaceTokens(spaceId) {
        const tokens = await this.prisma.deviceToken.findMany({
            where: { guest: { spaceId } },
            select: { token: true },
        });
        return tokens.map((t) => t.token);
    }
    async getActiveGuestTokens(spaceId) {
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
    async getAdminTokens(spaceId) {
        const tokens = await this.prisma.deviceToken.findMany({
            where: { guest: { spaceId, isAdmin: true } },
            select: { token: true },
        });
        return tokens.map((t) => t.token);
    }
    async notifyEventLive(spaceId, eventTitle, venue) {
        const tokens = await this.getActiveGuestTokens(spaceId);
        const { title, body } = notification_templates_1.NotificationTemplates.eventLive(eventTitle, venue);
        await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'EVENT_LIVE' });
        await this.persistNotification(spaceId, title, body, 'EVENT_LIVE');
    }
    async notifyPerformanceLive(spaceId, performers, songName) {
        const tokens = await this.getActiveGuestTokens(spaceId);
        const { title, body } = notification_templates_1.NotificationTemplates.performanceLive(performers, songName);
        await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'PERFORMANCE_LIVE' });
        await this.persistNotification(spaceId, title, body, 'PERFORMANCE_LIVE');
    }
    async notifyGuestArrived(spaceId, guestName, relation) {
        const tokens = await this.getAdminTokens(spaceId);
        const { title, body } = notification_templates_1.NotificationTemplates.guestArrived(guestName, relation);
        await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'GUEST_ARRIVED' });
    }
    async notifySpaceLive(spaceId, spaceName) {
        const tokens = await this.getSpaceTokens(spaceId);
        const { title, body } = notification_templates_1.NotificationTemplates.spaceLive(spaceName);
        await this.firebase.sendMulticast(tokens, title, body, { spaceId, type: 'SPACE_LIVE' });
        await this.persistNotification(spaceId, title, body, 'SPACE_LIVE');
    }
    async broadcast(dto) {
        const space = await this.prisma.space.findUnique({ where: { id: dto.spaceId } });
        if (!space)
            throw new common_1.NotFoundException('Space not found');
        const tokens = await this.getSpaceTokens(dto.spaceId);
        await this.firebase.sendMulticast(tokens, dto.title, dto.body, {
            spaceId: dto.spaceId,
            type: 'BROADCAST',
        });
        await this.persistNotification(dto.spaceId, dto.title, dto.body, 'BROADCAST');
        return { sent: tokens.length, title: dto.title };
    }
    async persistNotification(spaceId, title, body, type) {
        const guests = await this.prisma.guest.findMany({
            where: { spaceId },
            select: { id: true },
        });
        if (guests.length === 0)
            return;
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        firebase_service_1.FirebaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map
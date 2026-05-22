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
exports.SpaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const events_gateway_1 = require("../../websocket/events.gateway");
const client_1 = require("@prisma/client");
function generateInviteCode(name) {
    const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${suffix}`;
}
let SpaceService = class SpaceService {
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async createSpace(dto) {
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
    async getSpace(id) {
        const space = await this.prisma.space.findUnique({
            where: { id },
            include: {
                events: { orderBy: { startTime: 'asc' } },
                _count: { select: { guests: true, feedPosts: true } },
            },
        });
        if (!space)
            throw new common_1.NotFoundException('Space not found');
        return space;
    }
    async updateStatus(id, dto) {
        const space = await this.prisma.space.update({
            where: { id },
            data: { status: dto.status },
        });
        this.gateway.broadcastToSpace(id, 'server:space_status_updated', {
            spaceId: id,
            status: dto.status,
        });
        if (dto.status === client_1.SpaceStatus.LIVE) {
            this.gateway.broadcastToBigScreen(id, 'bigscreen:flash_announcement', {
                title: `${space.name} is now LIVE! 🎉`,
            });
        }
        return space;
    }
    async getGuests(spaceId) {
        return this.prisma.guest.findMany({
            where: { spaceId },
            orderBy: { createdAt: 'asc' },
            include: { user: { select: { phone: true } } },
        });
    }
};
exports.SpaceService = SpaceService;
exports.SpaceService = SpaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], SpaceService);
//# sourceMappingURL=space.service.js.map
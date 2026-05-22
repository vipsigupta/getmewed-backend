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
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../firebase/firebase.service");
const prisma_service_1 = require("../prisma/prisma.service");
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor(firebase, prisma) {
        this.firebase = firebase;
        this.prisma = prisma;
        this.logger = new common_1.Logger(EventsGateway_1.name);
        this.spaceCounts = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
            if (!token)
                throw new common_1.UnauthorizedException('No token provided');
            const decodedToken = await this.firebase.verifyIdToken(token);
            const user = await this.prisma.user.findUnique({
                where: { firebaseUid: decodedToken.uid },
            });
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            client.data.user = user;
            this.logger.log(`Client authenticated: ${client.id} (User: ${user.id})`);
        }
        catch (error) {
            this.logger.warn(`Socket authentication failed: ${error.message}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const spaceId = client.data?.spaceId;
        if (spaceId) {
            const current = this.spaceCounts.get(spaceId) || 1;
            this.spaceCounts.set(spaceId, Math.max(0, current - 1));
            this.broadcastPresence(spaceId);
        }
    }
    async handleJoinSpace(data, client) {
        const { spaceId } = data;
        const user = client.data.user;
        if (!user)
            return { error: 'Unauthorized' };
        const guest = await this.prisma.guest.findUnique({
            where: { userId_spaceId: { userId: user.id, spaceId } },
        });
        if (!guest) {
            this.logger.warn(`User ${user.id} attempted to join space ${spaceId} without participation`);
            return { error: 'Not participating in this space' };
        }
        client.join(`space:${spaceId}`);
        client.data.spaceId = spaceId;
        client.data.guestId = guest.id;
        this.spaceCounts.set(spaceId, (this.spaceCounts.get(spaceId) || 0) + 1);
        this.broadcastPresence(spaceId);
        this.logger.log(`Client ${client.id} joined space:${spaceId}`);
        return { event: 'server:joined', data: { spaceId } };
    }
    handleJoinBigScreen(data, client) {
        const room = `space:${data.spaceId}:bigscreen`;
        client.join(room);
        this.logger.log(`Big screen joined room: ${room}`);
        return { event: 'server:bigscreen_joined', data: { spaceId: data.spaceId } };
    }
    handleLeaveSpace(data, client) {
        client.leave(`space:${data.spaceId}`);
        client.data.spaceId = null;
    }
    handlePingReaction(data, client) {
        client.to(`space:${data.spaceId}`).emit('server:reaction_ping', data);
    }
    broadcastToSpace(spaceId, event, payload) {
        this.server.to(`space:${spaceId}`).emit(event, payload);
    }
    broadcastToBigScreen(spaceId, event, payload) {
        this.server.to(`space:${spaceId}:bigscreen`).emit(event, payload);
    }
    broadcastPresence(spaceId) {
        const activeGuests = this.spaceCounts.get(spaceId) || 0;
        this.broadcastToSpace(spaceId, 'server:presence_update', { activeGuests });
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('client:join_space'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], EventsGateway.prototype, "handleJoinSpace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('client:join_bigscreen'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinBigScreen", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('client:leave_space'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveSpace", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('client:ping_reaction'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePingReaction", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    }),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService,
        prisma_service_1.PrismaService])
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private spaceCounts: Map<string, number> = new Map();

  constructor(
    private readonly firebase: FirebaseService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('No token provided');

      const decodedToken = await this.firebase.verifyIdToken(token);
      const user = await this.prisma.user.findUnique({
        where: { firebaseUid: decodedToken.uid },
      });

      if (!user) throw new UnauthorizedException('User not found');

      client.data.user = user;
      this.logger.log(`Client authenticated: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.warn(`Socket authentication failed: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Decrement space presence count
    const spaceId = client.data?.spaceId;
    if (spaceId) {
      const current = this.spaceCounts.get(spaceId) || 1;
      this.spaceCounts.set(spaceId, Math.max(0, current - 1));
      this.broadcastPresence(spaceId);
    }
  }

  // ---------- CLIENT → SERVER ----------

  @SubscribeMessage('client:join_space')
  async handleJoinSpace(
    @MessageBody() data: { spaceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { spaceId } = data;
    const user = client.data.user;

    if (!user) return { error: 'Unauthorized' };

    // Verify participation
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

    // Increment presence
    this.spaceCounts.set(spaceId, (this.spaceCounts.get(spaceId) || 0) + 1);
    this.broadcastPresence(spaceId);

    this.logger.log(`Client ${client.id} joined space:${spaceId}`);
    return { event: 'server:joined', data: { spaceId } };
  }

  @SubscribeMessage('client:join_bigscreen')
  handleJoinBigScreen(
    @MessageBody() data: { spaceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `space:${data.spaceId}:bigscreen`;
    client.join(room);
    this.logger.log(`Big screen joined room: ${room}`);
    return { event: 'server:bigscreen_joined', data: { spaceId: data.spaceId } };
  }

  @SubscribeMessage('client:leave_space')
  handleLeaveSpace(
    @MessageBody() data: { spaceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`space:${data.spaceId}`);
    client.data.spaceId = null;
  }

  @SubscribeMessage('client:ping_reaction')
  handlePingReaction(
    @MessageBody() data: { spaceId: string; postId: string; emoji: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Optimistic fast-path: forward reaction to all clients in the room instantly
    client.to(`space:${data.spaceId}`).emit('server:reaction_ping', data);
  }

  // ---------- SERVER → CLIENT broadcast helpers ----------
  // Called by FeedService, EventService, PerformanceService, etc.

  broadcastToSpace(spaceId: string, event: string, payload: any) {
    this.server.to(`space:${spaceId}`).emit(event, payload);
  }

  broadcastToBigScreen(spaceId: string, event: string, payload: any) {
    this.server.to(`space:${spaceId}:bigscreen`).emit(event, payload);
  }

  private broadcastPresence(spaceId: string) {
    const activeGuests = this.spaceCounts.get(spaceId) || 0;
    this.broadcastToSpace(spaceId, 'server:presence_update', { activeGuests });
  }
}

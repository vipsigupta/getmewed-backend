import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinWedding')
  handleJoinWedding(@MessageBody() data: { weddingId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.weddingId);
    return { event: 'joined', data: { weddingId: data.weddingId } };
  }

  // Called when a new feed post is created
  broadcastNewPost(weddingId: string, post: any) {
    this.server.to(weddingId).emit('newFeedPost', post);
  }

  // Called when performance status changes
  broadcastPerformanceUpdate(weddingId: string, performance: any) {
    this.server.to(weddingId).emit('performanceUpdate', performance);
  }

  // Called for live event states
  broadcastEventState(weddingId: string, event: any) {
    this.server.to(weddingId).emit('eventStateUpdate', event);
  }
}

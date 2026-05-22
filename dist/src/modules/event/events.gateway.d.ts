import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinWedding(data: {
        weddingId: string;
    }, client: Socket): {
        event: string;
        data: {
            weddingId: string;
        };
    };
    broadcastNewPost(weddingId: string, post: any): void;
    broadcastPerformanceUpdate(weddingId: string, performance: any): void;
    broadcastEventState(weddingId: string, event: any): void;
}

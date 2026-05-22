import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly firebase;
    private readonly prisma;
    server: Server;
    private readonly logger;
    private spaceCounts;
    constructor(firebase: FirebaseService, prisma: PrismaService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinSpace(data: {
        spaceId: string;
    }, client: Socket): Promise<{
        error: string;
        event?: undefined;
        data?: undefined;
    } | {
        event: string;
        data: {
            spaceId: string;
        };
        error?: undefined;
    }>;
    handleJoinBigScreen(data: {
        spaceId: string;
    }, client: Socket): {
        event: string;
        data: {
            spaceId: string;
        };
    };
    handleLeaveSpace(data: {
        spaceId: string;
    }, client: Socket): void;
    handlePingReaction(data: {
        spaceId: string;
        postId: string;
        emoji: string;
    }, client: Socket): void;
    broadcastToSpace(spaceId: string, event: string, payload: any): void;
    broadcastToBigScreen(spaceId: string, event: string, payload: any): void;
    private broadcastPresence;
}

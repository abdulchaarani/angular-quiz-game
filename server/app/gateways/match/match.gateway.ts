import { Injectable } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchEvents } from './match.gateway.events';

// Future TODO: Open socket only if code and user are valid + Allow host to be able to disconnect banned players
// TODO: Add interface/DTO for Rooms + Add Message Schema
@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    private readonly room = '7777'; // TODO: Define the interface for Match Rooms + Create array

    // Could also be with HTTP
    @SubscribeMessage(MatchEvents.ValidateRoomCode)
    validateRoomCode(@ConnectedSocket() _: Socket, code: string) {
        // TODO: Implement actual validation
        return { isValid: true };
    }

    // Could also be with HTTP
    @SubscribeMessage(MatchEvents.ValidateUsername)
    validateUsername(@ConnectedSocket() _: Socket, username: string) {
        // TODO: Implement actual validation
        return { isValid: true };
    }

    @SubscribeMessage(MatchEvents.JoinRoom)
    joinRoom(@ConnectedSocket() socket: Socket) {
        socket.join(this.room);
    }

    @SubscribeMessage(MatchEvents.RoomMessage)
    roomMessage(@ConnectedSocket() socket: Socket, message: string) {
        // TODO: Change message for Message with interface instead of string only
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(MatchEvents.RoomMessage, message);
        }
    }

    handleConnection(@ConnectedSocket() socket: Socket) {
        console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        socket.emit('Hello', 'Hello World!');
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }
}

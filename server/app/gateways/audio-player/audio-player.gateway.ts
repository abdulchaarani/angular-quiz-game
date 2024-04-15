import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AudioEvents } from '@common/events/audio.events';
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class AudioPlayerGateway {
    @WebSocketServer() private server: Server;

    @SubscribeMessage(AudioEvents.PlayPanicSound)
    playPanicSound(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        this.server.to(matchRoomCode).emit(AudioEvents.PlayPanicSound);
    }
}

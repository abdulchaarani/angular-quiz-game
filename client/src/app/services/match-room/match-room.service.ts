import { Injectable } from '@angular/core';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    constructor(public socketService: SocketHandlerService) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
    }

    configureBaseSocketFeatures() {
        this.socketService.on('connect', () => {
            console.log(`Connexion par WebSocket sur le socket ${this.socketId}`);
            this.socketService.on('Hello', (message: string) => {
                console.log(message);
            });
        });
    }

    joinRoom() {
        this.socketService.send('joinRoom');
    }

    sendToRoom() {
        this.socketService.send('roomMessage', 'OEUF');
    }
}

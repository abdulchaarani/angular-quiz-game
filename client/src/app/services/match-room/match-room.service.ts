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
        // Première chose: On se connecte et on vérifie si une connexion existe.
        // Si existe: On ne fait rien
        // Sinon, on se connecte au serveur
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.configureBaseSocketFeatures();
        }
        this.socketService.connect();
        this.configureBaseSocketFeatures();
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

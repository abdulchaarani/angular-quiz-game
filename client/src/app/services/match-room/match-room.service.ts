import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    private matchRoomCode: string;
    constructor(
        public socketService: SocketHandlerService,
        private router: Router,
    ) {
        this.matchRoomCode = '';
    }

    getMatchRoomCode() {
        return this.matchRoomCode;
    }

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

    createRoom(stringifiedGame: string) {
        this.socketService.send('createRoom', stringifiedGame, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.router.navigateByUrl('/waiting-room');
        });
    }

    joinRoom(roomCode: string, username: string) {
        this.socketService.send('joinRoom', { roomCode, username }, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.router.navigateByUrl('/waiting-room');
        });
    }

    sendToRoom() {
        this.socketService.send('roomMessage', 'OEUF');
    }
}

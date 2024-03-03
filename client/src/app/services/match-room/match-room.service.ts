import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';

interface userInfo {
    roomCode: string;
    username: string;
}

@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    private matchRoomCode: string;
    private username: string;
    constructor(
        public socketService: SocketHandlerService,
        private router: Router,
        private notificationService: NotificationService,
    ) {
        this.matchRoomCode = '';
        this.username = '';
    }

    getMatchRoomCode() {
        return this.matchRoomCode;
    }

    getUsername() {
        return this.username;
    }

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            // Add "on" functions here
            this.redirectAfterDisconnection();
        }
    }

    private redirectAfterDisconnection() {
        this.socketService.on('disconnect', () => {
            this.router.navigateByUrl('/home');
            this.notificationService.displayErrorMessage('Vous avez été déconnecté de la partie.');
        });
    }

    createRoom(stringifiedGame: string) {
        this.socketService.send('createRoom', stringifiedGame, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = 'Organisateur';
            this.router.navigateByUrl('/match-room');
        });
    }

    joinRoom(roomCode: string, username: string) {
        const sentInfo: userInfo = { roomCode: roomCode, username };
        this.router.navigateByUrl('/match-room');
        this.socketService.send('joinRoom', sentInfo, (res: { code: string; username: string }) => {
            this.matchRoomCode = res.code;
            this.username = username;
        });
    }

    toggleLock() {
        // TODO: Make "Organisateur" a global constant
        if (this.username === 'Organisateur') {
            this.socketService.send('toggleLock', this.matchRoomCode);
        }
    }

    banUsername(username: string) {
        if (this.username === 'Organisateur') {
            const sentInfo: userInfo = { roomCode: this.matchRoomCode, username };
            this.socketService.send('banUsername', sentInfo);
        }
    }

    sendToRoom() {
        this.socketService.send('roomMessage', 'OEUF');
    }
}

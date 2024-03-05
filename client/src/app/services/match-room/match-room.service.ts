import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';

interface UserInfo {
    roomCode: string;
    username: string;
}
@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    players: Player[];
    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }
    constructor(
        public socketService: SocketHandlerService,
        private router: Router,
        private notificationService: NotificationService,
    ) {
        this.matchRoomCode = '';
        this.username = '';
        this.players = [];
    }
    private matchRoomCode: string;
    private username: string;

    getMatchRoomCode() {
        return this.matchRoomCode;
    }

    getUsername() {
        return this.username;
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            this.redirectAfterDisconnection();
            this.fetchPlayersData();
        }
    }

    disconnect() {
        this.socketService.disconnect();
        this.resetMatchValues();
    }

    createRoom(stringifiedGame: string) {
        this.socketService.send('createRoom', stringifiedGame, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = 'Organisateur';
            // this.router.navigateByUrl('/match-room');
        });
    }

    joinRoom(roomCode: string, username: string) {
        const sentInfo: UserInfo = { roomCode, username };
        this.socketService.send('joinRoom', sentInfo, (res: { code: string; username: string }) => {
            this.matchRoomCode = res.code;
            this.username = res.username;
            this.router.navigateByUrl('/match-room');
        });
        this.socketService.send('sendPlayersData', roomCode); // Updates the list for everyone with new player
    }

    toggleLock() {
        // TODO: Make "Organisateur" a global constant
        if (this.username === 'Organisateur') {
            this.socketService.send('toggleLock', this.matchRoomCode);
        }
    }

    banUsername(username: string) {
        if (this.username === 'Organisateur') {
            const sentInfo: UserInfo = { roomCode: this.matchRoomCode, username };
            this.socketService.send('banUsername', sentInfo);
        }
    }

    updatePlayerScore(username: string, points: number) {
        const sentUserInfo: UserInfo = { roomCode: this.matchRoomCode, username };

        this.socketService.send('updateScore', { sentUserInfo, points });
    }

    private fetchPlayersData() {
        this.socketService.on('fetchPlayersData', (res: string) => {
            this.players = JSON.parse(res);
        });
    }

    private redirectAfterDisconnection() {
        this.socketService.on('disconnect', () => {
            this.router.navigateByUrl('/home');
            this.resetMatchValues();
            this.notificationService.displayErrorMessage('Vous avez été déconnecté de la partie.');
        });
    }

    private resetMatchValues() {
        this.matchRoomCode = '';
        this.username = '';
        this.players = [];
    }
}

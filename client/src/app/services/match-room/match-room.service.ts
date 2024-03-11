import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { Question } from '@app/interfaces/question';
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

    private matchRoomCode: string;
    private username: string;

    constructor(
        public socketService: SocketHandlerService,
        private router: Router,
        private notificationService: NotificationService,
    ) {
        this.matchRoomCode = '';
        this.username = '';
        this.players = [];
    }

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }
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
            this.beginQuiz();
            this.moveToNextQuestion();
            this.gameOver();
            this.feedback();
        }
    }

    disconnect() {
        this.socketService.disconnect();
        this.resetMatchValues();
    }

    createRoom(gameId: string) {
        this.socketService.send('createRoom', gameId, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = 'Organisateur';
            this.router.navigateByUrl('/match-room');
        });
    }

    joinRoom(roomCode: string, username: string) {
        const sentInfo: UserInfo = { roomCode, username };
        this.socketService.send('joinRoom', sentInfo, (res: { code: string; username: string }) => {
            this.matchRoomCode = res.code;
            this.username = res.username;
            this.router.navigateByUrl('/match-room');
        });
        this.sendPlayersData(roomCode);
    }

    sendPlayersData(roomCode: string) {
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

    startMatch() {
        this.socketService.send('startMatch', this.matchRoomCode);
    }

    nextQuestion() {
        this.socketService.send('nextQuestion', this.matchRoomCode);
    }

    beginQuiz() {
        this.socketService.on('beginQuiz', () => {
            console.log('beginQuiz');
        });
    }

    gameOver() {
        this.socketService.on('gameOver', () => {
            console.log('gameOver');
        });
    }

    moveToNextQuestion() {
        this.socketService.on('nextQuestion', (question: Question) => {
            console.log(question);
        });
    }

    fetchPlayersData() {
        this.socketService.on('fetchPlayersData', (res: string) => {
            this.players = JSON.parse(res);
        });
    }

    redirectAfterDisconnection() {
        this.socketService.on('disconnect', () => {
            this.router.navigateByUrl('/home');
            this.resetMatchValues();
            this.notificationService.displayErrorMessage('Vous avez été déconnecté de la partie.');
        });
    }

    resetMatchValues() {
        this.matchRoomCode = '';
        this.username = '';
        this.players = [];
    }

    private feedback() {
        this.socketService.on('feedback', (feedback) => console.log(feedback));
    }
}

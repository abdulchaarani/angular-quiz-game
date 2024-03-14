import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '@app/interfaces/message';
import { Player } from '@app/interfaces/player';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

interface UserInfo {
    roomCode: string;
    username: string;
}
@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    players: Player[];
    messages: Message[];

    currentQuestion$: Observable<Question>;
    displayCooldown$: Observable<boolean>;
    private startMatchSubject = new Subject<void>();
    private gameTitle = new Subject<string>();
    private currentQuestionSource = new Subject<Question>();
    private displayCooldownSource = new BehaviorSubject<boolean>(false);
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
        this.messages = [];
        this.initialiseMatchSubjects();
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
            this.startCooldown();
        }
    }

    disconnect() {
        this.socketService.disconnect();
        this.resetMatchValues();
    }

    createRoom(gameId: string, isTestRoom: boolean = false) {
        console.log('Creating room', isTestRoom);
        this.socketService.send('createRoom', { gameId, isTestPage: isTestRoom }, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = 'Organisateur';
            if (isTestRoom) {
                // this.beginQuiz();
                this.players = [{ username: 'tester', score: 0, bonusCount: 0, isPlaying: true }];
                this.router.navigateByUrl('/play-test');
            } else this.router.navigateByUrl('/match-room');
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

    joinTestRoom(roomCode: string, username: string) {
        const sentInfo: UserInfo = { roomCode, username };
        this.socketService.send('joinRoom', sentInfo, (res: { code: string; username: string }) => {
            this.matchRoomCode = res.code;
            this.username = res.username;
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

    matchStarted() {
        this.socketService.on('matchStarting', (data: { start: boolean; gameTitle: string }) => {
            if (data.start) {
                this.startMatchSubject.next();
            }
            if (data.gameTitle) {
                this.gameTitle.next(data.gameTitle);
            }
        });
    }

    beginQuiz() {
        this.socketService.on('beginQuiz', (data: { firstQuestion: Question; gameDuration: number; isTestRoom: boolean }) => {
            const { firstQuestion, gameDuration, isTestRoom } = data;
            if (isTestRoom) {
                this.router.navigate(['/play-test'], { state: { question: firstQuestion, duration: gameDuration } });
                console.log('beginQuiz', firstQuestion, gameDuration);
            } else this.router.navigate(['/play-match'], { state: { question: firstQuestion, duration: gameDuration } });
        });
    }

    getStartMatchObservable(): Observable<void> {
        return this.startMatchSubject.asObservable();
    }

    getGameTitleObservable(): Observable<string> {
        return this.gameTitle.asObservable();
    }

    nextQuestion() {
        this.socketService.send('nextQuestion', this.matchRoomCode);
    }

    startCooldown() {
        this.socketService.on('startCooldown', () => {
            this.displayCooldownSource.next(true);
        });
    }

    gameOver() {
        this.socketService.on('gameOver', (isTestRoom) => {
            console.log('gameOver, isTestRoom:', isTestRoom);
            if (isTestRoom) {
                this.router.navigateByUrl('/host');
            } else {
                console.log('gameOver');
            }
        });
    }

    moveToNextQuestion() {
        this.socketService.on('nextQuestion', (question: Question) => {
            this.displayCooldownSource.next(false);
            this.currentQuestionSource.next(question);
        });
    }

    fetchPlayersData() {
        this.socketService.on('fetchPlayersData', (res: string) => {
            this.players = JSON.parse(res);
            console.log('players', res);
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

    private initialiseMatchSubjects() {
        this.startMatchSubject = new Subject<void>();
        this.gameTitle = new Subject<string>();
        this.currentQuestionSource = new Subject<Question>();
        this.displayCooldownSource = new BehaviorSubject<boolean>(false);
        this.currentQuestion$ = this.currentQuestionSource.asObservable();
        this.displayCooldown$ = this.displayCooldownSource.asObservable();
    }
}

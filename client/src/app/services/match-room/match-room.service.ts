import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '@app/interfaces/message';
import { Player } from '@app/interfaces/player';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { UserInfo } from '@common/interfaces/user-info';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';

const HOST_USERNAME = 'Organisateur';

@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    players: Player[];
    messages: Message[];
    isResults: boolean;
    isWaitOver: boolean;
    startMatch$: Observable<boolean>;
    gameTitle$: Observable<string>;
    isHostPlaying$: Observable<boolean>;
    currentQuestion$: Observable<Question>;
    displayCooldown$: Observable<boolean>;

    private startMatchSource = new Subject<boolean>();
    private gameTitleSource = new Subject<string>();
    private currentQuestionSource = new Subject<Question>();
    private hostPlayingSource = new BehaviorSubject<boolean>(false);
    private displayCooldownSource = new BehaviorSubject<boolean>(false);
    private matchRoomCode: string;
    private username: string;

    constructor(
        public socketService: SocketHandlerService,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
    ) {}

    get socketId() {
        return this.socketService.socket.id ? this.socketService.socket.id : '';
    }

    getRoomCode() {
        return this.matchRoomCode;
    }

    getUsername() {
        return this.username;
    }

    connect() {
        if (!this.socketService.isSocketAlive()) {
            this.resetMatchValues();
            this.initialiseMatchSubjects();
            this.socketService.connect();
            this.redirectAfterDisconnection();
            this.fetchPlayersData();
            this.matchStarted();
            this.beginQuiz();
            this.moveToNextQuestion();
            this.gameOver();
            this.startCooldown();
            this.onHostQuit();
            this.handleError();
        }
    }

    disconnect() {
        this.socketService.disconnect();
    }

    createRoom(gameId: string, isTestRoom: boolean = false) {
        this.socketService.send('createRoom', { gameId, isTestPage: isTestRoom }, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = 'Organisateur';
            if (isTestRoom) {
                this.players = [{ username: this.username, score: 0, bonusCount: 0, isPlaying: true }];
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

    sendPlayersData(roomCode: string) {
        this.socketService.send('sendPlayersData', roomCode);
    }

    toggleLock() {
        if (this.username === HOST_USERNAME) {
            this.socketService.send('toggleLock', this.matchRoomCode);
        }
    }

    banUsername(username: string) {
        if (this.username === HOST_USERNAME) {
            const sentInfo: UserInfo = { roomCode: this.matchRoomCode, username };
            this.socketService.send('banUsername', sentInfo);
        }
    }

    handleError() {
        this.socketService.on('error', (errorMessage: string) => {
            this.notificationService.displayErrorMessage(errorMessage);
        });
    }

    startMatch() {
        this.socketService.send('startMatch', this.matchRoomCode);
    }

    matchStarted() {
        this.socketService.on('matchStarting', (data: { start: boolean; gameTitle: string }) => {
            if (data.start) {
                this.startMatchSource.next(true);
            }
            if (data.gameTitle) {
                this.gameTitleSource.next(data.gameTitle);
            }
        });
    }

    beginQuiz() {
        this.socketService.on('beginQuiz', (data: { firstQuestion: Question; gameDuration: number; isTestRoom: boolean }) => {
            this.isWaitOver = true;
            const { firstQuestion, gameDuration, isTestRoom } = data;
            if (isTestRoom) {
                this.router.navigate(['/play-test'], { state: { question: firstQuestion, duration: gameDuration } });
            } else this.router.navigate(['/play-match'], { state: { question: firstQuestion, duration: gameDuration } });
        });
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
            console.log('Game over');
            if (isTestRoom) {
                console.log('Test room game over');
                this.router.navigateByUrl('/host');
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
        });
    }

    onHostQuit() {
        this.socketService.on('hostQuitMatch', () => {
            this.hostPlayingSource.next(false);
        });
    }

    redirectAfterDisconnection() {
        this.socketService.on('disconnect', () => {
            this.router.navigateByUrl('/home');
            this.resetMatchValues();
        });
    }

    resetMatchValues() {
        this.matchRoomCode = '';
        this.username = '';
        this.players = [];
        this.messages = [];
        this.isResults = false;
        this.isWaitOver = false;
    }

    routeToResultsPage() {
        this.socketService.send('routeToResultsPage', this.matchRoomCode);
    }

    listenRouteToResultsPage() {
        this.socketService.on('routeToResultsPage', () => {
            this.isResults = true;
            this.router.navigateByUrl('/results');
        });
    }

    private initialiseMatchSubjects() {
        this.startMatchSource = new Subject<boolean>();
        this.gameTitleSource = new Subject<string>();
        this.currentQuestionSource = new Subject<Question>();
        this.hostPlayingSource = new BehaviorSubject<boolean>(true);
        this.displayCooldownSource = new BehaviorSubject<boolean>(false);
        this.startMatch$ = this.startMatchSource.asObservable();
        this.gameTitle$ = this.gameTitleSource.asObservable();
        this.isHostPlaying$ = this.hostPlayingSource.asObservable();
        this.currentQuestion$ = this.currentQuestionSource.asObservable();
        this.displayCooldown$ = this.displayCooldownSource.asObservable();
    }
}

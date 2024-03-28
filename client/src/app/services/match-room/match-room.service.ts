import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatchContext } from '@app/constants/states';
import { Message } from '@app/interfaces/message';
import { Player } from '@app/interfaces/player';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { HOST_USERNAME } from '@common/constants/match-constants';
import { PlayerState } from '@common/constants/player-states';
import { MatchEvents } from '@common/events/match.events';
import { UserInfo } from '@common/interfaces/user-info';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Subject } from 'rxjs/internal/Subject';
import { QuestionContextService } from '../question-context/question-context.service';

@Injectable({
    providedIn: 'root',
})
export class MatchRoomService {
    players: Player[];
    messages: Message[];
    isResults: boolean;
    isWaitOver: boolean;
    isBanned: boolean;
    isPlaying: boolean;

    startMatch$: Observable<boolean>;
    gameTitle$: Observable<string>;
    isHostPlaying$: Observable<boolean>;
    currentQuestion$: Observable<Question>;
    displayCooldown$: Observable<boolean>;
    isBanned$: Observable<boolean>;

    private startMatchSource = new Subject<boolean>();
    private gameTitleSource = new Subject<string>();
    private currentQuestionSource = new Subject<Question>();
    private hostPlayingSource = new BehaviorSubject<boolean>(false);
    private displayCooldownSource = new BehaviorSubject<boolean>(false);
    private bannedSource = new BehaviorSubject<boolean>(false);
    private matchRoomCode: string;
    private username: string;

    constructor(
        public socketService: SocketHandlerService,
        private readonly router: Router,
        private readonly notificationService: NotificationService,
        private readonly questionContextService: QuestionContextService,
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
            this.onRedirectAfterDisconnection();
            this.onFetchPlayersData();
            this.onMatchStarted();
            this.onBeginQuiz();
            this.onNextQuestion();
            this.onGameOver();
            this.onStartCooldown();
            this.onHostQuit();
            this.onPlayerKick();
            this.handleError();
        }
    }

    disconnect() {
        this.socketService.disconnect();
    }

    createRoom(gameId: string, isTestRoom: boolean = false, isRandomMode: boolean = false) {
        this.socketService.send(MatchEvents.CreateRoom, { gameId, isTestPage: isTestRoom, isRandomMode }, (res: { code: string }) => {
            this.matchRoomCode = res.code;
            this.username = HOST_USERNAME;
            if (isTestRoom) {
                this.players = [{ username: this.username, score: 0, bonusCount: 0, isPlaying: true, state: PlayerState.default }];
                this.router.navigateByUrl('/play-test');
            } else {
                this.sendPlayersData(this.matchRoomCode);
                this.router.navigateByUrl('/match-room');
            }
        });
    }

    joinRoom(roomCode: string, username: string) {
        const sentInfo: UserInfo = { roomCode, username };
        this.socketService.send(MatchEvents.JoinRoom, sentInfo, (res: { code: string; username: string; isRandomMode: boolean }) => {
            if (res.isRandomMode) {
                this.questionContextService.setContext(MatchContext.RandomMode);
            }
            this.matchRoomCode = res.code;
            this.username = res.username;
            this.router.navigateByUrl('/match-room');
        });
        this.sendPlayersData(roomCode);
    }

    sendPlayersData(roomCode: string) {
        this.socketService.send(MatchEvents.SendPlayersData, roomCode);
    }

    toggleLock() {
        if (this.username === HOST_USERNAME) {
            this.socketService.send(MatchEvents.ToggleLock, this.matchRoomCode);
        }
    }

    banUsername(username: string) {
        if (this.username === HOST_USERNAME) {
            const sentInfo: UserInfo = { roomCode: this.matchRoomCode, username };
            this.socketService.send(MatchEvents.BanUsername, sentInfo);
        }
    }

    handleError() {
        this.socketService.on(MatchEvents.Error, (errorMessage: string) => {
            this.notificationService.displayErrorMessage(errorMessage);
        });
    }

    startMatch() {
        this.socketService.send(MatchEvents.StartMatch, this.matchRoomCode);
    }

    onMatchStarted() {
        this.socketService.on(MatchEvents.MatchStarting, (data: { start: boolean; gameTitle: string }) => {
            if (data.start) {
                this.startMatchSource.next(true);
            }
            if (data.gameTitle) {
                this.gameTitleSource.next(data.gameTitle);
            }
        });
    }

    onBeginQuiz() {
        this.socketService.on(MatchEvents.BeginQuiz, (data: { firstQuestion: Question; gameDuration: number; isTestRoom: boolean }) => {
            this.isWaitOver = true;
            const { firstQuestion, gameDuration, isTestRoom } = data;
            if (isTestRoom) {
                this.router.navigate(['/play-test'], { state: { question: firstQuestion, duration: gameDuration } });
            } else this.router.navigate(['/play-match'], { state: { question: firstQuestion, duration: gameDuration } });
        });
    }

    nextQuestion() {
        this.socketService.send(MatchEvents.NextQuestion, this.matchRoomCode);
    }

    onStartCooldown() {
        this.socketService.on(MatchEvents.StartCooldown, () => {
            this.displayCooldownSource.next(true);
        });
    }

    onGameOver() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.on(MatchEvents.GameOver, (data: any) => {
            const { isTestRoom, isRandomMode } = data;
            if (isTestRoom && !isRandomMode) {
                this.router.navigateByUrl('/host');
            } else if (isRandomMode) {
                this.routeToResultsPage();
            }
        });
    }

    onNextQuestion() {
        this.socketService.on(MatchEvents.NextQuestion, (question: Question) => {
            this.displayCooldownSource.next(false);
            this.currentQuestionSource.next(question);
        });
    }

    onFetchPlayersData() {
        this.socketService.on(MatchEvents.FetchPlayersData, (res: string) => {
            this.players = JSON.parse(res);
        });
    }

    onHostQuit() {
        this.socketService.on(MatchEvents.HostQuitMatch, () => {
            this.hostPlayingSource.next(false);
        });
    }

    onRedirectAfterDisconnection() {
        this.socketService.on(MatchEvents.Disconnect, () => {
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
        this.isBanned = false;
        this.isPlaying = false;
    }

    routeToResultsPage() {
        this.socketService.send(MatchEvents.RouteToResultsPage, this.matchRoomCode);
    }

    onRouteToResultsPage() {
        this.socketService.on(MatchEvents.RouteToResultsPage, () => {
            this.isResults = true;
            this.router.navigateByUrl('/results');
        });
    }

    onPlayerKick() {
        this.socketService.on(MatchEvents.KickPlayer, () => {
            this.bannedSource.next(true);
            this.disconnect();
        });
    }

    private initialiseMatchSubjects() {
        this.startMatchSource = new Subject<boolean>();
        this.gameTitleSource = new Subject<string>();
        this.currentQuestionSource = new Subject<Question>();
        this.hostPlayingSource = new BehaviorSubject<boolean>(true);
        this.displayCooldownSource = new BehaviorSubject<boolean>(false);
        this.bannedSource = new BehaviorSubject<boolean>(false);
        this.startMatch$ = this.startMatchSource.asObservable();
        this.gameTitle$ = this.gameTitleSource.asObservable();
        this.isHostPlaying$ = this.hostPlayingSource.asObservable();
        this.currentQuestion$ = this.currentQuestionSource.asObservable();
        this.displayCooldown$ = this.displayCooldownSource.asObservable();
        this.isBanned$ = this.bannedSource.asObservable();
    }
}

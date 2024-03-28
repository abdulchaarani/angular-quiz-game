/* eslint-disable @typescript-eslint/no-explicit-any */
// Lines were added to explain why ESlint was disabled at specific lines
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Player } from '@app/interfaces/player';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Socket } from 'socket.io-client';
import { MatchRoomService } from './match-room.service';
import SpyObj = jasmine.SpyObj;

class SocketHandlerServiceMock extends SocketHandlerService {
    // Override connect() is required to not actually connect the socket
    // eslint-disable-next-line  @typescript-eslint/no-empty-function
    override connect() {}
}

describe('MatchRoomService', () => {
    let service: MatchRoomService;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let router: SpyObj<Router>;
    let notificationService: SpyObj<NotificationService>;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
        notificationService = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);

        socketHelper = new SocketTestHelper();
        socketSpy = new SocketHandlerServiceMock(router);
        socketSpy.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: Router, useValue: router },
                { provide: NotificationService, useValue: notificationService },
            ],
        });
        service = TestBed.inject(MatchRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('connect() should connect the socket if it is not alive', () => {
        const checkSpy = spyOn(socketSpy, 'isSocketAlive').and.returnValue(false);
        const redirectSpy = spyOn(service, 'onRedirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'onFetchPlayersData');
        const handleErrorSpy = spyOn(service, 'handleError');
        const startSpy = spyOn(service, 'onMatchStarted');
        const beginSpy = spyOn(service, 'onBeginQuiz');
        const moveSpy = spyOn(service, 'onNextQuestion');
        const cooldownSpy = spyOn(service, 'onStartCooldown');
        const hostSpy = spyOn(service, 'onHostQuit');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalled();
        expect(handleErrorSpy).toHaveBeenCalled();
        expect(startSpy).toHaveBeenCalled();
        expect(beginSpy).toHaveBeenCalled();
        expect(moveSpy).toHaveBeenCalled();
        expect(cooldownSpy).toHaveBeenCalled();
        expect(hostSpy).toHaveBeenCalled();
    });

    it('connect() should not connect the socket if it is alive', () => {
        const checkSpy = spyOn(socketSpy, 'isSocketAlive').and.returnValue(true);
        const redirectSpy = spyOn(service, 'onRedirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'onFetchPlayersData');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('getSocketId() should return socket id if it is defined, else an empty string', () => {
        const cases = [
            { socketId: 'mock', expectedResult: 'mock' },
            { socketId: undefined, expectedResult: '' },
        ];
        for (const { socketId, expectedResult } of cases) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (service.socketService.socket as any).id = socketId;
            expect(service.socketId).toEqual(expectedResult);
        }
    });

    it('getRoomCode() should return match room code', () => {
        const mockCode = 'mockCode';
        service['matchRoomCode'] = mockCode;
        expect(service.getRoomCode()).toEqual(mockCode);
    });

    it('getUsername() should return the username', () => {
        const mockUsername = 'mockUsername';
        service['username'] = mockUsername;
        expect(service.getUsername()).toEqual(mockUsername);
    });

    it('createRoom should send event, update values for matchRoomCode and username, then redirect to play-test if test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(socketSpy, 'send').and.callFake((event, data, cb: (param: any) => any) => {
            cb({ code: 'mock' });
        });
        const mockStringifiedGame = 'mockGame';
        service.createRoom(mockStringifiedGame, true, false);
        expect(service['matchRoomCode']).toEqual('mock');
        expect(service['username']).toEqual('Organisateur');
        expect(router.navigateByUrl).toHaveBeenCalledWith('/play-test');
        expect(spy).toHaveBeenCalledWith('createRoom', { gameId: 'mockGame', isTestPage: true, isRandomMode: false }, jasmine.any(Function));
    });

    it('createRoom should send event, update values for matchRoomCode and username, then redirect to match-room if not test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn(socketSpy, 'send').and.callFake((event, data, cb: (param: any) => any) => {
            cb({ code: 'mock' });
        });
        const mockStringifiedGame = 'mockGame';
        const sendPlayersSpy = spyOn(service, 'sendPlayersData');
        service.createRoom(mockStringifiedGame, false, false);
        expect(service['matchRoomCode']).toEqual('mock');
        expect(service['username']).toEqual('Organisateur');
        expect(router.navigateByUrl).toHaveBeenCalledWith('/match-room');
        expect(spy).toHaveBeenCalledWith('createRoom', { gameId: 'mockGame', isTestPage: false, isRandomMode: false }, jasmine.any(Function));
        expect(sendPlayersSpy).toHaveBeenCalled();
    });

    it('joinRoom() should send a joinRoom event, update values, and then a sendPlayersData event', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sendSpy = spyOn(socketSpy, 'send').and.callFake((event, data, cb: (param: any) => any) => {
            cb({ code: 'mockReturnedCode', username: 'mockReturnedUsername', isRandomMode: true });
        });
        const sendPlayersSpy = spyOn(service, 'sendPlayersData');
        service.joinRoom('mockSentCode', 'mockSentUsername');
        expect(service['matchRoomCode']).toEqual('mockReturnedCode');
        expect(service['username']).toEqual('mockReturnedUsername');
        expect(router.navigateByUrl).toHaveBeenCalledWith('/match-room');
        expect(sendSpy).toHaveBeenCalledWith('joinRoom', { roomCode: 'mockSentCode', username: 'mockSentUsername' }, jasmine.any(Function));
        expect(sendPlayersSpy).toHaveBeenCalled();
    });

    it('sendPlayersData should send sendPlayersData event to socket', () => {
        const sendSpy = spyOn(socketSpy, 'send');
        const mockCode = 'mockCode';
        service.sendPlayersData(mockCode);
        expect(sendSpy).toHaveBeenCalled();
    });

    it('toggleLock() should send toggleLock event if username is Organisateur', () => {
        service['username'] = 'Organisateur';
        const spy = spyOn(socketSpy, 'send');
        service.toggleLock();
        expect(spy).toHaveBeenCalled();
    });

    it('toggleLock() should not send toggleLock event if username is not Organisateur', () => {
        service['username'] = '';
        const spy = spyOn(socketSpy, 'send');
        service.toggleLock();
        expect(spy).not.toHaveBeenCalled();
    });

    it('banUsername() should send banUsername event if user is host', () => {
        service['username'] = 'Organisateur';
        service['matchRoomCode'] = '';
        const sendSpy = spyOn(socketSpy, 'send');
        service.banUsername('mockUsername');
        expect(sendSpy).toHaveBeenCalledWith('banUsername', { roomCode: '', username: 'mockUsername' });
    });

    it('should call disconnect of socketService', () => {
        const disconnectSpy = spyOn(socketSpy, 'disconnect');
        service.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('startMatch() should send startMatch event', () => {
        const sendSpy = spyOn(socketSpy, 'send');
        service['matchRoomCode'] = '';
        service.startMatch();
        expect(sendSpy).toHaveBeenCalledWith('startMatch', '');
    });

    it('handleError() should display error message', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('mock');
        });
        service.handleError();
        socketHelper.peerSideEmit('error', 'mock');
        socketHelper.emit('error', 'mock');
        expect(onSpy).toHaveBeenCalled();
        expect(notificationService.displayErrorMessage).toHaveBeenCalled();
        socketHelper.disconnect();
    });

    it('onMatchStarted() should send matchStarting event and update gameTitle', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ start: true, gameTitle: 'mockTitle' });
        });
        service.onMatchStarted();
        socketHelper.peerSideEmit('matchStarting', { start: true, gameTitle: 'mockTitle' });
        expect(onSpy).toHaveBeenCalled();
    });

    it('onBeginQuiz() should send game data and navigate to /play-test in test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ firstQuestion: 'mockQuestion', gameDuration: 0, isTestRoom: true });
        });
        service.onBeginQuiz();
        socketHelper.peerSideEmit('beginQuiz', { firstQuestion: 'mockQuestion', gameDuration: 0, isTestRoom: true });
        expect(onSpy).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/play-test'], { state: { question: 'mockQuestion', duration: 0 } });
    });

    it('onBeginQuiz() should send game data and navigate to /play-match when not in test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ firstQuestion: 'mockQuestion', gameDuration: 0, isTestRoom: false });
        });
        service.onBeginQuiz();
        socketHelper.peerSideEmit('beginQuiz', { firstQuestion: 'mockQuestion', gameDuration: 0, isTestRoom: true });
        expect(onSpy).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/play-match'], { state: { question: 'mockQuestion', duration: 0 } });
    });

    it('nextQuestion() should send nextQuestion event', () => {
        const sendSpy = spyOn(socketSpy, 'send');
        service['matchRoomCode'] = '';
        service.nextQuestion();
        expect(sendSpy).toHaveBeenCalledWith('nextQuestion', '');
    });

    it('startCooldown() should send startCooldown event', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('');
        });
        service.onStartCooldown();
        socketHelper.peerSideEmit('startCooldown');
        expect(onSpy).toHaveBeenCalled();
    });

    it('onGameOver() should navigate to /host in test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ isTestRoom: true, isRandomMode: false });
        });
        service.onGameOver();
        socketHelper.peerSideEmit('gameOver', true);
        expect(onSpy).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/host');
    });

    it('onGameOver() should route to resuts page in random mode', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ isTestRoom: true, isRandomMode: true });
        });
        spyOn(service, 'routeToResultsPage');
        service.onGameOver();
        socketHelper.peerSideEmit('gameOver', true);
        expect(onSpy).toHaveBeenCalled();
        expect(service.routeToResultsPage).toHaveBeenCalled();
    });

    it('onGameOver() should not navigate to /host when not in test room', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb(false);
        });
        service.onGameOver();
        socketHelper.peerSideEmit('gameOver', false);
        expect(onSpy).toHaveBeenCalled();
        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('onNextQuestion() should send nextQuestion event', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('mockQuestion');
        });
        service.onNextQuestion();
        socketHelper.peerSideEmit('nextQuestion', 'mockQuestion');
        expect(onSpy).toHaveBeenCalled();
    });

    it('onFetchPlayersData() should update players when receiving event', () => {
        service.players = [];
        const mockPlayer: Player = {
            username: '',
            score: 0,
            bonusCount: 0,
            isPlaying: false,
        } as Player;
        const mockStringifiedPlayer = JSON.stringify([mockPlayer]);
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketHelper, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb({ res: mockStringifiedPlayer });
        });
        const parseSpy = spyOn(JSON, 'parse').and.returnValue([mockPlayer]);
        service.onFetchPlayersData();
        socketHelper.peerSideEmit('fetchPlayersData', mockStringifiedPlayer);
        expect(service.players).toEqual([mockPlayer]);
        expect(parseSpy).toHaveBeenCalled();
        expect(onSpy).toHaveBeenCalled();
    });

    it('onRedirectAfterDisconnection() should redirect to home, reset values and display error message when receiving disconnect event', () => {
        const resetSpy = spyOn(service, 'resetMatchValues');
        service.onRedirectAfterDisconnection();
        socketHelper.peerSideEmit('disconnect');
        expect(resetSpy).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalled();
    });

    it('resetMatchValues() should reset matchRoomCode, username, and players', () => {
        service['matchRoomCode'] = 'mock';
        service['username'] = 'mock';
        const mockPlayer: Player = {
            username: '',
            score: 0,
            bonusCount: 0,
            isPlaying: true,
        } as Player;
        service['players'] = [mockPlayer];
        service.resetMatchValues();
        expect(service['matchRoomCode']).toEqual('');
        expect(service['username']).toEqual('');
        expect(service['players']).toEqual([]);
    });

    it('routeToResultsPage() should send routeToResultsPage event', () => {
        const sendSpy = spyOn(socketSpy, 'send');
        service['matchRoomCode'] = '';
        service.routeToResultsPage();
        expect(sendSpy).toHaveBeenCalledWith('routeToResultsPage', '');
    });

    it('onRouteToResultsPage() should receive the route and navigate to /results', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('');
        });
        service.onRouteToResultsPage();
        socketHelper.peerSideEmit('routeToResultsPage');
        expect(onSpy).toHaveBeenCalled();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/results');
    });

    it('onHostQuit() should set isHostPlaying to false', () => {
        service['hostPlayingSource'].next(true);
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('');
        });
        service.onHostQuit();
        socketHelper.peerSideEmit('hostQuitMatch');
        expect(onSpy).toHaveBeenCalled();
    });

    it('onPlayerKick() should set isBanned to true and disconnect player', () => {
        service['bannedSource'].next(false);
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb('');
        });
        const disconnectSpy = spyOn(socketSpy, 'disconnect');

        service.onPlayerKick();
        socketHelper.peerSideEmit('kickPlayer');
        expect(service['bannedSource'].value).toBe(true);
        expect(onSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
    });
});

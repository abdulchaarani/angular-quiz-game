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
    override connect() {}
}

fdescribe('MatchRoomService', () => {
    let service: MatchRoomService;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let router: SpyObj<Router>;
    let notificationService: SpyObj<NotificationService>;

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
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
        const redirectSpy = spyOn(service, 'redirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'fetchPlayersData');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('connect() should not connect the socket if it is alive', () => {
        const checkSpy = spyOn(socketSpy, 'isSocketAlive').and.returnValue(true);
        const redirectSpy = spyOn(service, 'redirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'fetchPlayersData');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('disconnect() should disconnect the socket and reset match values', () => {
        const resetSpy = spyOn(service, 'resetMatchValues');
        const disconnectSpy = spyOn(socketSpy, 'disconnect').and.callFake(() => {});
        service.disconnect();
        expect(resetSpy).toHaveBeenCalled();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('createRoom should send event, update values for matchRoomCode and username, then redirect to match-room', () => {
        const spy = spyOn(socketSpy, 'send').and.callFake((event, data, cb: Function) => {
            cb({ code: 'mock' });
        });
        const mockStringifiedGame = 'mockGame';
        service.createRoom(mockStringifiedGame);
        expect((service as any).matchRoomCode).toEqual('mock');
        expect((service as any).username).toEqual('Organisateur');
        expect(router.navigateByUrl).toHaveBeenCalledWith('/match-room');
        expect(spy).toHaveBeenCalledWith('createRoom', mockStringifiedGame, jasmine.any(Function));
    });

    it('joinRoom() should send a joinRoom event, update values, and then a sendPlayersData event', () => {
        const sendSpy = spyOn(socketSpy, 'send').and.callFake((event, data, cb: Function) => {
            cb({ code: 'mockReturnedCode', username: 'mockReturnedUsername' });
        });
        const sendPlayersSpy = spyOn(service, 'sendPlayersData');
        service.joinRoom('mockSentCode', 'mockSentUsername');
        expect((service as any).matchRoomCode).toEqual('mockReturnedCode');
        expect((service as any).username).toEqual('mockReturnedUsername');
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
        (service as any).username = 'Organisateur';
        const spy = spyOn(socketSpy, 'send');
        service.toggleLock();
        expect(spy).toHaveBeenCalled();
    });

    it('toggleLock() should not send toggleLock event if username is not Organisateur', () => {
        (service as any).username = '';
        const spy = spyOn(socketSpy, 'send');
        service.toggleLock();
        expect(spy).not.toHaveBeenCalled();
    });

    it('fetchPlayersData() should update players when receiving event', () => {
        // TODO
    });

    it('redirectAfterDisconnection() should redirect to home, reset values and display error message when receiving disconnect event', () => {
        // TODO
    });

    it('resetMatchValues() should reset matchRoomCode, username, and players', () => {
        (service as any).matchRoomCode = 'mock';
        (service as any).username = 'mock';
        const mockPlayer: Player = {
            username: '',
            score: 0,
            bonusCount: 0,
            isPlaying: true,
        };
        (service as any).players = [mockPlayer];
        service.resetMatchValues();
        expect((service as any).matchRoomCode).toEqual('');
        expect((service as any).username).toEqual('');
        expect((service as any).players).toEqual([]);
    });
});

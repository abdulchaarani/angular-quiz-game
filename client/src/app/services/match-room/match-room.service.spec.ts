import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Player } from '@app/interfaces/player';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { MatchRoomService } from './match-room.service';
import SpyObj = jasmine.SpyObj;

fdescribe('MatchRoomService', () => {
    let service: MatchRoomService;
    let socketSpy: SpyObj<SocketHandlerService>;
    let router: SpyObj<Router>;
    let notificationService: SpyObj<NotificationService>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('SocketHandlerService', ['isSocketAlive', 'connect', 'disconnect', 'send', 'on']);
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        notificationService = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);
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
        const checkSpy = socketSpy.isSocketAlive.and.returnValue(false);
        const redirectSpy = spyOn(service, 'redirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'fetchPlayersData');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('connect() should not connect the socket if it is alive', () => {
        const checkSpy = socketSpy.isSocketAlive.and.returnValue(true);
        const redirectSpy = spyOn(service, 'redirectAfterDisconnection');
        const fetchSpy = spyOn(service, 'fetchPlayersData');
        service.connect();
        expect(checkSpy).toHaveBeenCalled();
        expect(redirectSpy).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('disconnect() should disconnect the socket and reset match values', () => {
        const resetSpy = spyOn(service, 'resetMatchValues');
        service.disconnect();
        expect(socketSpy.disconnect).toHaveBeenCalled();
        expect(resetSpy).toHaveBeenCalled();
    });

    it('createRoom should send event, update values for matchRoomCode and username, then redirect to match-room', () => {
        // TODO
    });

    it('joinRoom() should send a joinRoom event, update values, and then a sendPlayersData event', () => {
        // TODO
    });

    it('toggleLock() should send toggleLock event if username is Organisateur', () => {
        (service as any).username = 'Organisateur';
        service.toggleLock();
        expect(socketSpy.send).toHaveBeenCalled();
    });

    it('toggleLock() should not send toggleLock event if username is not Organisateur', () => {
        (service as any).username = '';
        service.toggleLock();
        expect(socketSpy.send).not.toHaveBeenCalled();
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

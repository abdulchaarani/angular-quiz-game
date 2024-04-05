/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Socket } from 'socket.io-client';
import { TimeService } from './time.service';
import SpyObj = jasmine.SpyObj;
import { TimerInfo } from '@common/interfaces/timer-info';
import { BehaviorSubject } from 'rxjs';

class SocketHandlerServiceMock extends SocketHandlerService {
    override connect() {
        /* Do nothing */
    }
}

describe('TimeService', () => {
    let service: TimeService;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let router: SpyObj<Router>;

    const FAKE_ROOM_ID = '1234';
    const TIME = 3;

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        socketHelper = new SocketTestHelper();
        socketSpy = new SocketHandlerServiceMock(router);
        socketSpy.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: Router, useValue: router },
            ],
        });
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('it should get the timerFinished$ subject as observable', () => {
        service['timerFinished'] = new BehaviorSubject<boolean>(false);
        const timerFinished$ = service.timerFinished$;
        expect(timerFinished$).toBeDefined();
    });

    it('it should set the time', () => {
        service['counter'] = 0;
        service.time = 10;
        expect(service['counter']).toEqual(10);
    });

    it('should emit startTimer event when startTimer() is called', () => {
        const spy = spyOn(socketSpy, 'send');
        service.startTimer(FAKE_ROOM_ID, TIME);
        expect(spy).toHaveBeenCalledWith('startTimer', { roomCode: FAKE_ROOM_ID, time: TIME });
    });

    it('should emit stopTimer event when stopTimer() is called', () => {
        const spy = spyOn(socketSpy, 'send');
        service.stopTimer(FAKE_ROOM_ID);
        expect(spy).toHaveBeenCalledWith('stopTimer', { roomCode: FAKE_ROOM_ID });
    });

    it('should emit pauseTimer event when pauseTimer() is called', () => {
        const spy = spyOn(socketSpy, 'send');
        service.pauseTimer(FAKE_ROOM_ID);
        expect(spy).toHaveBeenCalledWith('pauseTimer', FAKE_ROOM_ID);
    });

    it('should emit panicTimer event when panicTimer() is called', () => {
        const spy = spyOn(socketSpy, 'send');
        service.panicTimer(FAKE_ROOM_ID);
        expect(spy).toHaveBeenCalledWith('panicTimer', FAKE_ROOM_ID);
        expect(service.isPanicking).toBeTrue();
    });

    it('should detect timer event and update its time attribute', () => {
        const timerInfo: TimerInfo = { currentTime: 1, duration: 10 };
        const spy = spyOn(socketSpy, 'on').and.callFake((event: string, callback: (params: any) => any) => {
            callback(timerInfo);
        });
        service.handleTimer();
        socketHelper.peerSideEmit('timer', timerInfo);
        expect(service.time).toEqual(1);
        expect(spy).toHaveBeenCalledWith('timer', jasmine.any(Function));
    });

    it('should detect stopTimer event and notify observers of timerFinished', () => {
        const spy = spyOn(socketSpy, 'on').and.callFake((event: string, callback: (params: any) => any) => {
            callback(true);
        });
        service['timerFinished'].next(false);
        service.handleStopTimer();
        socketHelper.peerSideEmit('stopTimer');
        expect(service['timerFinished'].value).toBe(true);
        expect(spy).toHaveBeenCalledWith('stopTimer', jasmine.any(Function));
    });

    it('should compute timer progress with computeTimerProgress() and return a percentage', () => {
        service['initialValue'] = 10;
        service.time = 5;
        const result = service.computeTimerProgress();
        expect(result).toEqual(50);
    });
});

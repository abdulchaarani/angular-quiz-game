import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { TimeService } from './time.service';
import { Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import SpyObj = jasmine.SpyObj;

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
    // const TIMEOUT = 5;
    // const MS_SECOND = 1000;

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

    it('should detect timer event and update its time attribute', () => {
        // Rend le test plus facile a lire et sauve du temps
        // eslint-disable-next-line @typescript-eslint/ban-types
        const spy = spyOn(socketSpy, 'on').and.callFake((event: string, callback: Function) => {
            callback(1);
        });
        service.handleTimer();
        expect(service.time).toEqual(1);
        expect(spy).toHaveBeenCalledWith('timer', jasmine.any(Function));
    });

    it('should detect stopTimer event and notify observers of timerFinished', () => {
        // Rend le test plus facile a lire et sauve du temps
        // eslint-disable-next-line @typescript-eslint/ban-types
        const spy = spyOn(socketSpy, 'on').and.callFake((event: string, callback: Function) => {
            callback(true);
        });
        service.handleStopTimer();
        expect(service.timerFinished$).toBeTruthy();
        expect(spy).toHaveBeenCalledWith('stopTimer', jasmine.any(Function));
    });
});

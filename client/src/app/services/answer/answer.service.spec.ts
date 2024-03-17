import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Feedback } from '@common/interfaces/feedback';
import { UserInfo } from '@common/interfaces/user-info';
import { Socket } from 'socket.io-client';
import { AnswerService } from './answer.service';
import SpyObj = jasmine.SpyObj;

class SocketHandlerServiceMock extends SocketHandlerService {
    // Override connect() is required to not actually connect the socket
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    override connect() {}
}

describe('AnswerService', () => {
    let service: AnswerService;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let router: SpyObj<Router>;

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['']);
        socketHelper = new SocketTestHelper();
        socketSpy = new SocketHandlerServiceMock(router);
        socketSpy.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: Router, useValue: router },
            ],
        });
        service = TestBed.inject(AnswerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send the selected choice info', () => {
        const choice = 'A';
        const userInfo: UserInfo = { roomCode: '123', username: 'John' };
        const choiceInfo = { choice, userInfo };

        spyOn(service.socketService, 'send');

        service.selectChoice(choice, userInfo);

        expect(service.socketService.send).toHaveBeenCalledWith('selectChoice', choiceInfo);
    });

    it('should send the deselected choice info', () => {
        const choice = 'A';
        const userInfo: UserInfo = { roomCode: '123', username: 'John' };
        const choiceInfo = { choice, userInfo };

        spyOn(service.socketService, 'send');

        service.deselectChoice(choice, userInfo);

        expect(service.socketService.send).toHaveBeenCalledWith('deselectChoice', choiceInfo);
    });

    it('should send the answer info', () => {
        const userInfo: UserInfo = { roomCode: '123', username: 'John' };

        spyOn(service.socketService, 'send');

        service.submitAnswer(userInfo);

        expect(service.socketService.send).toHaveBeenCalledWith('submitAnswer', userInfo);
    });

    it('should receive feedback', () => {
        const feedback: Feedback = { correctAnswer: ['A'], score: 100 };

        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const feedbackSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb(feedback);
        });

        service.feedback();
        socketHelper.peerSideEmit('feedback', feedback);

        expect(feedbackSpy).toHaveBeenCalled();
    });

    it('should receive bonus points', () => {
        const bonusPoints = 100;

        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bonusPointsSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => any) => {
            cb(bonusPoints);
        });

        service.bonusPoints();
        socketHelper.peerSideEmit('bonus', bonusPoints);

        expect(bonusPointsSpy).toHaveBeenCalled();
    });

    it('should receive gameOver event', () => {
        // Any is required to simulate Function type in tests
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameOverSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: (param: any) => void) => {
            cb('');
        });
        service.gameOver();
        socketHelper.peerSideEmit('endGame');
        expect(gameOverSpy).toHaveBeenCalled();
    });
});

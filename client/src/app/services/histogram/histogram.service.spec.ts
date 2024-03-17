import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Histogram } from '@common/interfaces/histogram';
import { Socket } from 'socket.io-client';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
import { HistogramService } from './histogram.service';
import SpyObj = jasmine.SpyObj;

class SocketHandlerServiceMock extends SocketHandlerService {
    override connect() {}
}

describe('HistogramService', () => {
    let service: HistogramService;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let router: SpyObj<Router>;

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate']);
        socketHelper = new SocketTestHelper();
        socketSpy = new SocketHandlerServiceMock(router);
        socketSpy.socket = socketHelper as unknown as Socket;

        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: Router, useValue: router },
            ],
        });
        service = TestBed.inject(HistogramService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call currentHistogram', () => {
        const histogram:Histogram = {
            question: 'question',
            choiceTallies: []
        };
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: Function) => {
            cb({ histogram });
        });

        service.currentHistogram();

        expect(onSpy).toHaveBeenCalled();
    });

    it('should call histogramHistory', () => {
        const histogram:Histogram[] = [];
        const onSpy = spyOn(socketSpy, 'on').and.callFake((event: string, cb: Function) => {
            cb({ histogram });
        });

        service.histogramHistory();

        expect(onSpy).toHaveBeenCalled();
    });
});

import { MatchGateway } from '@app/gateways/match/match.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, BroadcastOperator } from 'socket.io';
import { TimeService } from './time.service';

describe('TimeService', () => {
    let service: TimeService;
    let server: SinonStubbedInstance<Server>;
    let gateway: SinonStubbedInstance<MatchGateway>;

    const FAKE_ROOM_ID = '1234';
    const TICK = 1000;

    // TODO : Make constants file & remove magic numbers (generate fake time?)
    const fakeCounter = new Map<string, number>([
        [FAKE_ROOM_ID, 3],
        ['3333', 10],
        ['2990', 0],
    ]);

    const fakeInterval = new Map<string, NodeJS.Timeout>([
        [
            FAKE_ROOM_ID,
            setInterval(() => {
                /* do nothing */
            }),
        ],
    ]);

    const TIMER_VALUE = 3;
    const TIMEOUT = 3000;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);
        gateway = createStubInstance<MatchGateway>(MatchGateway);
        jest.useFakeTimers();
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimeService, { provide: MatchGateway, useValue: gateway }, { provide: Server, useValue: server }],
        }).compile();

        service = module.get<TimeService>(TimeService);
    });

    afterEach(async () => {
        service['intervals'].forEach((interval: NodeJS.Timeout) => {
            interval.unref();
        });
        jest.clearAllTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return counter associated with given room ID code', () => {
        service['counters'] = fakeCounter;
        const expectedResult = fakeCounter.get(FAKE_ROOM_ID);
        const result = service.getTime(FAKE_ROOM_ID);
        expect(result).toEqual(expectedResult);
    });

    it('should not start a timer in a room that already has a started timer', () => {
        service['intervals'] = fakeInterval;
        const result = service.startTimer(FAKE_ROOM_ID, TIMER_VALUE, server);
        expect(result).toBeUndefined();
    });

    it('should start a timer', () => {
        server.in.returns({
            emit: (event: string) => {
                expect(event).toEqual('timer');
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startTimer(FAKE_ROOM_ID, TIMER_VALUE, server);
        jest.advanceTimersByTime(TICK);
        expect(service['counters'].get(FAKE_ROOM_ID)).toBeDefined();
        expect(service['counters'].get(FAKE_ROOM_ID)).toEqual(2);
        expect(service['intervals'].get(FAKE_ROOM_ID)).toBeDefined();
    });

    it('should emit a timer event if time has not run out', () => {
        const intervals = fakeInterval;
        service.startTimer.call({ intervals, fakeCounter, TICK }, FAKE_ROOM_ID, server);
        jest.advanceTimersByTime(TICK);
        expect(server.in.calledWith(FAKE_ROOM_ID));
        expect(server.emit.calledWith('timer', TIMER_VALUE - 1));
    });

    it('should emit stopTimer event when time has run out', () => {
        service['counters'] = fakeCounter;
        const spy = jest.spyOn(service, 'stopTimer');
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('stopTimer');
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startTimer('2990', 0, server);
        jest.advanceTimersByTime(TICK);
        expect(spy).toHaveBeenCalled();
    });
});

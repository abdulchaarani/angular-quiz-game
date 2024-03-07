import { MatchGateway } from '@app/gateways/match/match.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Server, BroadcastOperator } from 'socket.io';
import { FAKE_ROOM_ID, TICK, TIMER_VALUE, FAKE_COUNTER, FAKE_INTERVAL } from '@app/constants/time-mocks';
import { TimeService } from './time.service';

describe('TimeService', () => {
    let service: TimeService;
    let server: SinonStubbedInstance<Server>;
    let gateway: SinonStubbedInstance<MatchGateway>;

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
        service['counters'] = FAKE_COUNTER;
        const expectedResult = FAKE_COUNTER.get(FAKE_ROOM_ID);
        const result = service.getTime(FAKE_ROOM_ID);
        expect(result).toEqual(expectedResult);
    });

    it('should not start a timer in a room that already has a started timer', () => {
        service['intervals'] = FAKE_INTERVAL;
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
        expect(service['counters'].get(FAKE_ROOM_ID)).toEqual(1);
        expect(service['intervals'].get(FAKE_ROOM_ID)).toBeDefined();
    });

    it('should emit a timer event if time has not run out', () => {
        service.startTimer.call({ intervals: FAKE_INTERVAL, counters: FAKE_COUNTER, tick: TICK }, FAKE_ROOM_ID, server);
        jest.advanceTimersByTime(TICK);
        expect(server.in.calledWith(FAKE_ROOM_ID));
        expect(server.emit.calledWith('timer', TIMER_VALUE - 1));
    });

    it('should emit stopTimer event when time has run out', () => {
        service['counters'] = FAKE_COUNTER;
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

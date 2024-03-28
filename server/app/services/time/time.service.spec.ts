import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { FAKE_COUNTER, FAKE_ROOM_ID, TICK, TIMER_VALUE } from '@app/constants/time-mocks';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { BroadcastOperator, Server } from 'socket.io';
import { TimeService } from './time.service';

const FAKE_INTERVAL = new Map<string, NodeJS.Timeout>([
    [
        FAKE_ROOM_ID,
        setInterval(() => {
            /* do nothing */
        }),
    ],
]);

describe('TimeService', () => {
    let service: TimeService;
    let server: SinonStubbedInstance<Server>;
    let gateway: SinonStubbedInstance<MatchGateway>;

    beforeEach(async () => {
        server = createStubInstance<Server>(Server);
        gateway = createStubInstance<MatchGateway>(MatchGateway);
        jest.useFakeTimers();
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimeService, { provide: MatchGateway, useValue: gateway }, { provide: Server, useValue: server }, EventEmitter2],
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
        const result = service.startTimer(server, FAKE_ROOM_ID, TIMER_VALUE, ExpiredTimerEvents.CountdownTimerExpired);
        expect(result).toBeUndefined();
    });

    it('should start a timer and emit a timer event if time has not run out', () => {
        server.in.returns({
            emit: (event: string) => {
                expect(event).toEqual('timer');
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startTimer(server, FAKE_ROOM_ID, TIMER_VALUE, ExpiredTimerEvents.CountdownTimerExpired);
        jest.advanceTimersByTime(TICK);
        expect(service['counters'].get(FAKE_ROOM_ID)).toBeDefined();
        expect(service['counters'].get(FAKE_ROOM_ID)).toEqual(1);
        expect(service['intervals'].get(FAKE_ROOM_ID)).toBeDefined();
    });

    it('should call startInterval in panic mode when isPanicking is set to true', () => {
        const PANIC_TICK = 250;
        service.startInterval(server, FAKE_ROOM_ID, TIMER_VALUE, ExpiredTimerEvents.CountdownTimerExpired, true);
        expect(service['tick']).toEqual(PANIC_TICK);
    });

    it('should call startInterval in normal mode when isPanicking is set to false', () => {
        const NORMAL_TICK = 1000;
        service.startInterval(server, FAKE_ROOM_ID, TIMER_VALUE, ExpiredTimerEvents.CountdownTimerExpired);
        expect(service['tick']).toEqual(NORMAL_TICK);
    });

    // TODO : emit is undefined and im too tired to fix this
    it('should reset interval for set roomId, start a panic mode interval and emit a panic event when panicTimer() is called', () => {
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('panicTimer');
            },
        } as BroadcastOperator<unknown, unknown>);
        const spy = jest.spyOn(service, 'startInterval');
        service.panicTimer(server, FAKE_ROOM_ID);
        expect(spy).toHaveBeenCalled();
    });

    it('should pause timer if timer is not already paused and emit pause timer event', () => {
        service['intervals'] = FAKE_INTERVAL;
        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('pauseTimer');
            },
        } as BroadcastOperator<unknown, unknown>);
        service.pauseTimer(server, FAKE_ROOM_ID);
        expect(service['pauses'].get(FAKE_ROOM_ID)).toBeDefined();
        expect(service['pauses'].get(FAKE_ROOM_ID)).toBe(true);
    });

    it('should restart timer if pauseTimer() is called on an already paused timer', () => {
        const spy = jest.spyOn(service, 'startInterval');
        service['intervals'] = FAKE_INTERVAL;
        service['pauses'].set(FAKE_ROOM_ID, true);
        service.pauseTimer(server, FAKE_ROOM_ID);

        expect(service['pauses'].get(FAKE_ROOM_ID)).toBe(false);
        expect(spy).toHaveBeenCalled();
    });

    it('should call expire timer and reset timer with terminate timer when time runs out', () => {
        service['counters'] = FAKE_COUNTER;
        const terminateSpy = jest.spyOn(service, 'terminateTimer');
        const expireSpy = jest.spyOn(service, 'expireTimer');
        server.in.returns({
            emit: (event: string) => {
                expect(event).toEqual('timer');
            },
        } as BroadcastOperator<unknown, unknown>);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual('stopTimer');
            },
        } as BroadcastOperator<unknown, unknown>);
        service.startTimer(server, '2990', 0, ExpiredTimerEvents.CountdownTimerExpired);
        jest.advanceTimersByTime(TICK);
        expect(terminateSpy).toHaveBeenCalled();
        expect(expireSpy).toHaveBeenCalled();
    });
});

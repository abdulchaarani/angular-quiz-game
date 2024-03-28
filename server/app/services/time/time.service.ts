import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { TimerEvents } from '@common/events/timer.events';
import { TimerInfo } from '@common/interfaces/timer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';

const PANIC_TICK = 250;

@Injectable()
export class TimeService {
    private tick: number;
    private intervals: Map<string, NodeJS.Timeout>;
    // TODO : Rename to smt more elegant
    private pauses: Map<string, boolean>;
    private counters: Map<string, number>;
    private durations: Map<string, number>;

    constructor(private readonly eventEmitter: EventEmitter2) {
        this.counters = new Map();
        this.intervals = new Map();
        this.durations = new Map();
        this.pauses = new Map();
        this.tick = 1000;
    }

    getTime(roomId: string) {
        return this.counters.get(roomId);
    }

    // passing event allows decoupling of timer service
    // eslint-disable-next-line max-params
    startInterval(server: Server, roomId: string, startValue: number, onTimerExpiredEvent: ExpiredTimerEvents, isPanicking: boolean = false) {
        let timerInfo: TimerInfo = { currentTime: startValue, duration: this.durations.get(roomId) };
        let tick: number;
        // TODO : Find better solution later
        if (isPanicking) {
            tick = PANIC_TICK;
        } else {
            tick = this.tick;
        }
        this.intervals.set(
            roomId,
            setInterval(() => {
                const currentTime = this.counters.get(roomId);
                if (currentTime >= 0) {
                    timerInfo = { currentTime, duration: this.durations.get(roomId) };
                    server.in(roomId).emit(TimerEvents.Timer, timerInfo);
                    this.counters.set(roomId, currentTime - 1);
                } else {
                    this.expireTimer(roomId, server, onTimerExpiredEvent);
                }
            }, tick),
        );
    }

    // passing event allows decoupling of timer service
    // eslint-disable-next-line max-params
    startTimer(server: Server, roomId: string, startValue: number, onTimerExpiredEvent: ExpiredTimerEvents) {
        if (this.intervals.has(roomId) && !this.pauses.get(roomId)) return;
        const timerInfo: TimerInfo = { currentTime: startValue, duration: startValue };
        server.in(roomId).emit(TimerEvents.Timer, timerInfo);

        this.durations.set(roomId, startValue);
        this.counters.set(roomId, startValue - 1);
        this.pauses.set(roomId, false);

        this.startInterval(server, roomId, startValue, onTimerExpiredEvent);
    }

    panicTimer(server: Server, roomId: string) {
        clearInterval(this.intervals.get(roomId));
        this.startInterval(server, roomId, this.counters.get(roomId), ExpiredTimerEvents.QuestionTimerExpired, true);
        server.to(roomId).emit(TimerEvents.PanicTimer);
    }

    expireTimer(roomId: string, server: Server, onTimerExpiredEvent: ExpiredTimerEvents) {
        this.terminateTimer(roomId);
        server.to(roomId).emit(TimerEvents.StopTimer);
        this.eventEmitter.emit(onTimerExpiredEvent, roomId);
    }

    pauseTimer(server: Server, roomId: string) {
        if (this.pauses.get(roomId)) {
            this.startInterval(server, roomId, this.counters.get(roomId), ExpiredTimerEvents.CountdownTimerExpired);
            this.pauses.set(roomId, false);
        } else {
            this.pauses.set(roomId, true);
            clearInterval(this.intervals.get(roomId));
            server.to(roomId).emit(TimerEvents.PauseTimer);
        }
    }

    terminateTimer(roomId: string) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.counters.delete(roomId);
    }
}

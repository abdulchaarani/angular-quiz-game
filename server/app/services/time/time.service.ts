import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { TimerEvents } from '@common/events/timer.events';
import { TimerInfo } from '@common/interfaces/timer-info';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';

@Injectable()
export class TimeService {
    private tick: number;
    private intervals: Map<string, NodeJS.Timeout>;
    // TODO : Rename to smt more elegant
    private pauses: Map<string, boolean>;
    private counters: Map<string, number>;

    constructor(private readonly eventEmitter: EventEmitter2) {
        this.counters = new Map();
        this.intervals = new Map();
        this.pauses = new Map();
        this.tick = 1000;
    }

    getTime(roomId: string) {
        return this.counters.get(roomId);
    }

    // passing event allows decoupling of timer service
    // eslint-disable-next-line max-params
    startTimer(server: Server, roomId: string, startValue: number, onTimerExpiredEvent: ExpiredTimerEvents) {
        if (this.intervals.has(roomId) && !this.pauses.get(roomId)) return;
        let timerInfo: TimerInfo = { currentTime: startValue, duration: startValue };
        server.in(roomId).emit(TimerEvents.Timer, timerInfo);

        this.counters.set(roomId, startValue - 1);
        this.pauses.set(roomId, false);

        this.intervals.set(
            roomId,
            setInterval(() => {
                const currentTime = this.counters.get(roomId);
                if (currentTime >= 0) {
                    timerInfo = { currentTime, duration: startValue };
                    server.in(roomId).emit(TimerEvents.Timer, timerInfo);
                    this.counters.set(roomId, currentTime - 1);
                } else {
                    this.expireTimer(roomId, server, onTimerExpiredEvent);
                }
            }, this.tick),
        );
    }

    expireTimer(roomId: string, server: Server, onTimerExpiredEvent: ExpiredTimerEvents) {
        this.terminateTimer(roomId);
        server.to(roomId).emit(TimerEvents.StopTimer);
        this.eventEmitter.emit(onTimerExpiredEvent, roomId);
    }

    pauseTimer(server: Server, roomId: string) {
        this.pauses.set(roomId, true);
        clearInterval(this.intervals.get(roomId));

        server.to(roomId).emit(TimerEvents.PauseTimer);
    }

    terminateTimer(roomId: string) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.counters.delete(roomId);
    }
}

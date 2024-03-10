import { TimerEvents } from '@app/constants/timer-events';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Server } from 'socket.io';
// Ref
// https://stackoverflow.com/questions/42398795/countdown-timer-broadcast-with-socket-io-and-node-js

@Injectable()
export class TimeService {
    private readonly tick;
    private intervals: Map<string, NodeJS.Timeout>;
    private counters: Map<string, number>;

    constructor(private eventEmitter: EventEmitter2) {
        this.counters = new Map();
        this.intervals = new Map();
        this.tick = 1000;
    }

    getTime(roomId: string) {
        return this.counters.get(roomId);
    }

    // passing event permits decoupling of timer service
    // eslint-disable-next-line max-params
    startTimer(server: Server, roomId: string, startValue: number, onTimerExpiredEvent: TimerEvents) {
        if (this.intervals.has(roomId)) return;

        this.counters.set(roomId, startValue - 1);

        this.intervals.set(
            roomId,
            setInterval(() => {
                const currentTime = this.counters.get(roomId);
                if (currentTime >= 0) {
                    server.in(roomId).emit('timer', currentTime);
                    this.counters.set(roomId, currentTime - 1);
                } else {
                    this.expireTimer(roomId, server, onTimerExpiredEvent);
                }
            }, this.tick),
        );
    }

    expireTimer(roomId: string, server: Server, onTimerExpiredEvent: TimerEvents) {
        this.terminateTimer(roomId);
        server.to(roomId).emit('stopTimer'); // TODO: verify if still needed
        this.eventEmitter.emit(onTimerExpiredEvent, roomId);
    }

    terminateTimer(roomId: string) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.counters.delete(roomId);
    }
}

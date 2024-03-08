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

    startTimer(roomId: string, startValue: number, server: Server) {
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
                    this.stopTimer(roomId, server);
                }
            }, this.tick),
        );
    }

    stopTimer(roomId: string, server: Server) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
        this.counters.delete(roomId);
        server.to(roomId).emit('stopTimer');
        this.eventEmitter.emit('timerExpired', roomId);
    }
}

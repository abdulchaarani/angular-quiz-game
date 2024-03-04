import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TimeService {
    private tick;
    private intervals: Map<string, NodeJS.Timeout>;
    private counters: Map<string, number>;

    constructor() {
        this.counters = new Map();
        this.tick = 1000;
    }

    getTime(roomId: string) {
        return this.counters.get(roomId);
    }

    startTimer(roomId: string, startValue: number, server: Server) {
        if (this.intervals) return;
        this.counters.set(roomId, startValue);
        this.intervals.set(
            roomId,
            setInterval(() => {
                if (this.counters.get(roomId) > 0) {
                    server.to(roomId).emit('timer', this.counters.get(roomId));
                    // TODO : Find better solution to this
                    this.counters.set(roomId, this.counters.get(roomId) - 1);
                } else {
                    this.stopTimer(roomId);
                }
            }, this.tick),
        );
    }
    stopTimer(roomId: string) {
        clearInterval(this.counters.get(roomId));
        this.intervals.delete(roomId);
    }

    private setTime(roomId: string, newTime: number) {
        this.counters.set(roomId, newTime);
    }
}

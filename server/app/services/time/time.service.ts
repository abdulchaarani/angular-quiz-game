import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class TimeService {
    private readonly tick;
    private intervals: Map<string, NodeJS.Timeout>;
    private counters: Map<string, number>;

    constructor() {
        this.counters = new Map();
        this.intervals = new Map();
        this.tick = 1000;
    }

    getTime(roomId: string) {
        return this.counters.get(roomId);
    }

    startTimer(roomId: string, startValue: number, server: Server) {
        if (this.intervals.has(roomId)) return;

        this.counters.set(roomId, startValue);

        this.intervals.set(
            roomId,
            setInterval(() => {
                const currentTime = this.counters.get(roomId);
                if (currentTime > 0) {
                    server.in(roomId).emit('timer', currentTime);
                    this.counters.set(roomId, currentTime - 1);
                } else {
                    this.stopTimer(roomId, server);
                }
            }, this.tick),
        );
    }

    stopTimer(roomId: string, server: Server) {
        this.intervals.delete(roomId);
        clearInterval(this.counters.get(roomId));
        server.to(roomId).emit('stopTimer');
    }
}

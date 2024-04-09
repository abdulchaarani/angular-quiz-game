import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { TimerInfo } from '@common/interfaces/timer-info';
import { MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { TimerEvents } from '@common/events/timer.events';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    isPanicking: boolean;
    private counter: number;
    private initialValue: number;

    constructor(private readonly socketService: SocketHandlerService) {
        this.counter = 0;
        this.initialValue = 0;
        this.isPanicking = false;
    }

    get time() {
        return this.counter;
    }

    get duration() {
        return this.initialValue;
    }

    set time(newTime: number) {
        this.counter = newTime;
    }

    listenToTimerEvents() {
        this.handleTimer();
        this.handleStopTimer();
    }

    startTimer(roomCode: string, time: number): void {
        this.socketService.send(TimerEvents.StartTimer, { roomCode, time });
    }

    stopTimer(roomCode: string): void {
        this.socketService.send(TimerEvents.StopTimer, { roomCode });
    }

    pauseTimer(roomCode: string): void {
        this.socketService.send(TimerEvents.PauseTimer, roomCode);
    }

    panicTimer(roomCode: string): void {
        this.isPanicking = true;
        this.socketService.send(TimerEvents.PanicTimer, roomCode);
    }

    handleTimer(): void {
        this.socketService.on(TimerEvents.Timer, (timerInfo: TimerInfo) => {
            this.counter = timerInfo.currentTime;
            this.initialValue = timerInfo.duration;
        });
    }

    handleStopTimer(): void {
        this.socketService.on(TimerEvents.StopTimer, () => {
            this.isPanicking = false;
        });
    }

    computeTimerProgress(): number {
        return (this.time / this.duration) * MULTIPLICATION_FACTOR;
    }
}

import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { BehaviorSubject } from 'rxjs';
import { TimerInfo } from '@common/interfaces/timer-info';
import { MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { TimerEvents } from '@common/events/timer.events';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    private counter: number;
    private initialValue: number;
    private timerFinished: BehaviorSubject<boolean>;

    constructor(private readonly socketService: SocketHandlerService) {
        this.counter = 0;
        this.initialValue = 0;
        this.timerFinished = new BehaviorSubject<boolean>(false);
    }

    get time() {
        return this.counter;
    }

    get duration() {
        return this.initialValue;
    }

    get timerFinished$() {
        return this.timerFinished.asObservable();
    }

    set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(roomCode: string, time: number): void {
        this.socketService.send(TimerEvents.StartTimer, { roomCode, time });
    }

    stopTimer(roomCode: string): void {
        this.socketService.send(TimerEvents.StopTimer, { roomCode });
    }

    pauseTimer(roomCode: string): void {
        this.socketService.send(TimerEvents.PauseTimer, { roomCode });
    }

    handleTimer(): void {
        this.socketService.on(TimerEvents.Timer, (timerInfo: TimerInfo) => {
            this.counter = timerInfo.currentTime;
            this.initialValue = timerInfo.duration;
        });
    }

    handleStopTimer(): void {
        this.socketService.on(TimerEvents.StopTimer, () => {
            this.timerFinished.next(true);
        });
    }

    computeTimerProgress(): number {
        return (this.time / this.duration) * MULTIPLICATION_FACTOR;
    }
}

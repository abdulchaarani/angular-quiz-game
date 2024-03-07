import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    counter: number;
    private timerFinished: BehaviorSubject<boolean>;

    constructor(private socketService: SocketHandlerService) {
        this.counter = 0;
        this.timerFinished = new BehaviorSubject<boolean>(false);
    }

    get time() {
        return this.counter;
    }

    get timerFinished$() {
        return this.timerFinished.asObservable();
    }

    startTimer(roomCode: string, time: number): void {
        this.socketService.send('startTimer', { roomCode, time });
    }

    stopTimer(roomCode: string): void {
        this.socketService.send('stopTimer', { roomCode });
    }

    handleTimer(): void {
        this.socketService.on('timer', (currentTime: number) => {
            this.counter = currentTime;
        });
    }

    handleStopTimer(): void {
        this.socketService.on('stopTimer', () => {
            this.timerFinished.next(true);
        });
    }
}

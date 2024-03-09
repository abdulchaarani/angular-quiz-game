import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { BehaviorSubject } from 'rxjs';

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

    set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(roomCode: string, time: number): void {
        console.log('Starting timer');
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

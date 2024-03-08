import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    time: number;
    private timerFinished: BehaviorSubject<boolean>;

    constructor(private socketService: SocketHandlerService) {
        this.time = 0;
        this.timerFinished = new BehaviorSubject<boolean>(false);
    }

    get timerFinished$() {
        return this.timerFinished.asObservable();
    }

    startTimer(roomCode: string, time: number): void {
        console.log('Starting timer');
        this.socketService.send('startTimer', { roomCode, time });
    }

    stopTimer(roomId: string): void {
        this.socketService.socket.emit('stopTimer', { roomId });
    }

    handleTimer(): void {
        this.socketService.socket.on('timer', (currentTime: number) => {
            this.time = currentTime;
            console.log('Current time : ', currentTime);
        });
    }

    handleStopTimer(): void {
        this.socketService.socket.on('stopTimer', () => {
            this.timerFinished.next(true);
        });
    }
}

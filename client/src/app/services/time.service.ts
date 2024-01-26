import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    // TODO : Permettre plus qu'une minuterie à la fois
    private interval: number | undefined;
    private readonly tick = 1000;

    private timerFinished = new Subject<void>();

    get timerFinished$() {
        return this.timerFinished.asObservable();
    }

    private counter = 0;
    get time() {
        return this.counter;
    }
    private set time(newTime: number) {
        this.counter = newTime;
    }

    startTimer(startValue: number) {
        if (this.interval) return;
        this.time = startValue;
        this.interval = window.setInterval(() => {
            if (this.time > 0) {
                this.time--;
            } else {
                this.timerFinished.next();
                this.stopTimer();
            }
        }, this.tick);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
    }
}

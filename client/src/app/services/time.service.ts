import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TimeService {
    // TODO : Permettre plus qu'une minuterie à la fois
    private timerFinished: BehaviorSubject<boolean>;
    private interval: number | undefined;
    private tick;
    private counter;

    constructor() {
        this.timerFinished = new BehaviorSubject<boolean>(false);
        this.counter = 0;
        this.tick = 1000;
    }

    get timerFinished$() {
        return this.timerFinished;
    }

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
                this.stopTimer();
                this.timerFinished.next(true);
            }
        }, this.tick);
    }

    stopTimer() {
        clearInterval(this.interval);
        this.interval = undefined;
        this.timerFinished.next(false);
    }
}

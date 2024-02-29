import { Component } from '@angular/core';
import { TimeService } from '@app/services/time.service';

const TIMER_DURATION = 5;

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent {
    // TODO: Replace Dummy values using actual services with backend implementation
    isHost: boolean = true;
    code: string = '7777';
    playerUsernames: string[] = ['Totoro', 'Kiki', 'Jiji', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    isLocked: boolean;
    currentUsername: string = 'Organisateur';
    startTimerButton: boolean = false;
    private readonly multiplicationFactor = 100;

    constructor(public timeService: TimeService) {
        // TODO: Inject services in parameter + initialize values accordingly
    }
    get time() {
        return this.timeService.time;
    }

    rejectPlayerUsername(name: string) {
        console.log('TODO: rejeter ' + name);
    }

    startMatch() {
        // TODO: Check if isLocked + if at least one player
        this.startTimerButton = true;
        this.startTimer();
    }

    startTimer() {
        this.timeService.stopTimer();
        this.timeService.startTimer(TIMER_DURATION);
        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                // route to question page
            }
        });
    }

    computeTimerProgress(): number {
        return (this.timeService.time / TIMER_DURATION) * this.multiplicationFactor;
    }
}

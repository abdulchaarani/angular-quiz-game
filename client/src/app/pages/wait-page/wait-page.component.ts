import { Component } from '@angular/core';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';

const TIMER_DURATION = 5;
const MULTIPLICATION_FACTOR = 100;

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent {
    // TODO: Replace Dummy values using actual services with backend implementation
    isLocked: boolean;
    startTimerButton: boolean;
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
    ) {
        this.isLocked = false;
        this.startTimerButton = false;
    }
    get time() {
        return this.timeService.time;
    }
    get isHost() {
        return this.matchRoomService.getUsername() === 'Organisateur';
    }

    toggleLock() {
        this.matchRoomService.toggleLock();
    }

    banPlayerUsername(username: string) {
        this.matchRoomService.banUsername(username);
    }

    startMatch() {
        // TODO: Check if isLocked + if at least one player (send event to server)
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
        return (this.timeService.time / TIMER_DURATION) * MULTIPLICATION_FACTOR;
    }
}

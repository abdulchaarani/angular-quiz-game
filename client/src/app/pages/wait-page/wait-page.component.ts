import { Component, OnInit } from '@angular/core';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';

const TIMER_DURATION = 5;

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent implements OnInit {
    // TODO: Replace Dummy values using actual services with backend implementation
    playerUsernames: string[] = ['Totoro', 'Kiki', 'Jiji', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    isLocked: boolean;
    startTimerButton: boolean = false;
    private readonly multiplicationFactor = 100;

    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
    ) {}

    ngOnInit(): void {
        this.matchRoomService.connect();
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

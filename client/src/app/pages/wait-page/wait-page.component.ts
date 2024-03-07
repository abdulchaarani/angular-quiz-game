import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';

const COUNTDOWN_DURATION = 5;
const MULTIPLICATION_FACTOR = 100;

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent implements OnInit {
    // TODO: Replace Dummy values using actual services with backend implementation
    isLocked: boolean;
    startTimerButton: boolean;
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        public router: Router,
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

    ngOnInit(): void {
        this.matchRoomService.connect();
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();
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
        this.timeService.time = COUNTDOWN_DURATION;
        // this.startTimer();
        this.matchRoomService.startMatch();
    }

    startTimer() {
        this.timeService.startTimer(this.matchRoomService.getMatchRoomCode(), COUNTDOWN_DURATION);
        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                // route to question page
                this.router.navigateByUrl('/play');
            }
        });
    }

    computeTimerProgress(): number {
        return (this.timeService.time / COUNTDOWN_DURATION) * MULTIPLICATION_FACTOR;
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
    }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { TimeService } from '@app/services/time/time.service';

const COUNTDOWN_DURATION = 5;
const MULTIPLICATION_FACTOR = 100;

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent implements OnInit {
    isLocked: boolean;
    startTimerButton: boolean;
    gameTitle: string;
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        public router: Router,
        public matchService: MatchService,
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

        if (this.isHost) {
            this.gameTitle = this.matchService.currentGame.title;
        } else {
            this.matchRoomService.getGameTitleObservable().subscribe((title) => {
                this.gameTitle = title;
            });
        }

        this.matchRoomService.matchStarted();
        this.matchRoomService.getStartMatchObservable().subscribe(() => {
            this.startTimerButton = true;
        });
    }

    toggleLock() {
        this.matchRoomService.toggleLock();
    }

    banPlayerUsername(username: string) {
        this.matchRoomService.banUsername(username);
    }

    startMatch() {
        this.startTimerButton = true;
        this.matchRoomService.startMatch();
    }

    computeTimerProgress(): number {
        return (this.timeService.time / COUNTDOWN_DURATION) * MULTIPLICATION_FACTOR;
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
    }
}

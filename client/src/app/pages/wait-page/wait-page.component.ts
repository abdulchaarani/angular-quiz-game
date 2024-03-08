import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
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
        private questionContextService: QuestionContextService,
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
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();

        this.matchRoomService.connect();

        if (this.isHost) {
            this.gameTitle = this.matchService.currentGame.title;
            this.questionContextService.setContext('hostView');
        } else {
            this.matchRoomService.getGameTitleObservable().subscribe((title) => {
                this.gameTitle = title;
            });
            this.questionContextService.setContext('playerView');
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
        this.timeService.timerFinished$.subscribe((finished) => {
            if (finished) {
                this.matchRoomService.letsStartQuiz();
                console.log('Timer finished');
            }
        });
    }

    // TODO: Migrate to time service
    computeTimerProgress(): number {
        return (this.timeService.time / COUNTDOWN_DURATION) * MULTIPLICATION_FACTOR;
    }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WarningMessage } from '@app/constants/feedback-messages';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent implements OnInit, OnDestroy {
    isLocked: boolean;
    isWaitOver: boolean;
    startTimerButton: boolean;
    gameTitle: string;
    private eventSubscriptions: Subscription[] = [];

    // permit more class parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        public router: Router,
        public matchService: MatchService,
        private readonly questionContextService: QuestionContextService,
        private readonly notificationService: NotificationService,
    ) {}

    get time() {
        return this.timeService.time;
    }
    get isHost() {
        return this.matchRoomService.getUsername() === 'Organisateur';
    }

    get currentGame() {
        return this.matchService.currentGame;
    }

    canDeactivate(): CanDeactivateType {
        if (this.isWaitOver) return true;

        if (!this.matchRoomService.isHostPlaying) {
            this.matchRoomService.disconnect();
            return true;
        }

        const deactivateSubject = new Subject<boolean>();
        this.notificationService.openWarningDialog(WarningMessage.QUIT).subscribe((confirm: boolean) => {
            deactivateSubject.next(confirm);
            if (confirm) this.matchRoomService.disconnect();
        });
        return deactivateSubject;
    }

    ngOnInit(): void {
        this.resetWaitPage();
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();

        this.matchRoomService.connect();

        if (this.isHost) {
            this.gameTitle = this.currentGame.title;
            this.questionContextService.setContext('hostView');
        } else {
            this.eventSubscriptions.push(
                this.matchRoomService.getGameTitleObservable().subscribe((title) => {
                    this.gameTitle = title;
                }),
            );
            this.questionContextService.setContext('playerView');
        }

        this.matchRoomService.matchStarted();
        this.matchRoomService.beginQuiz();

        this.subscribeToStartMatch();
        this.subscribeToWaitOver();
    }

    ngOnDestroy(): void {
        this.eventSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.eventSubscriptions = [];
    }

    toggleLock() {
        this.matchRoomService.toggleLock();
    }

    banPlayerUsername(username: string) {
        this.matchRoomService.banUsername(username);
    }

    prepareStartOfMatch() {
        this.startTimerButton = true;
        this.matchRoomService.startMatch();
        return this.timeService.timerFinished$;
    }

    startMatch() {
        this.prepareStartOfMatch().subscribe((finished) => {
            if (finished) {
                this.ngOnDestroy();
            }
        });
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
    }

    private resetWaitPage() {
        this.isLocked = false;
        this.startTimerButton = false;
        this.isWaitOver = false;
    }

    private subscribeToStartMatch() {
        const startMatchSubscription = this.matchRoomService.getStartMatchObservable().subscribe(() => {
            this.startTimerButton = true;
        });
        this.eventSubscriptions.push(startMatchSubscription);
    }

    // TODO: rename
    private subscribeToWaitOver() {
        const beginQuizSubscription = this.matchRoomService.isWaitOver$.subscribe(() => {
            this.isWaitOver = true;
        });
        this.eventSubscriptions.push(beginQuizSubscription);
    }
}

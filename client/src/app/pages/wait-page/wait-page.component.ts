import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WarningMessage } from '@app/constants/feedback-messages';
import { MatchContext } from '@app/constants/states';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { MatchContextService } from '@app/services/question-context/question-context.service';
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
    isQuitting: boolean;
    isBanned: boolean;
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
        private readonly matchContextService: MatchContextService,
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
        if (this.isQuitting) return true;
        if (!this.matchRoomService.isHostPlaying) return true;
        if (this.matchRoomService.isWaitOver) return true;
        if (this.isBanned) return true;

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

        this.subscribeToStartMatch();
        this.subscribeToBanishment();

        if (this.isHost) {
            this.gameTitle = this.currentGame.title;
        } else {
            if (!this.matchContextService.getContext()) {
                this.matchContextService.setContext(MatchContext.PlayerView);
            }
            this.subscribeToGameTitle();
        }
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

    quitGame() {
        this.isQuitting = true;
        this.matchRoomService.disconnect();
    }

    private resetWaitPage() {
        this.matchRoomService.isHostPlaying = true;
        this.isLocked = false;
        this.isQuitting = false;
        this.startTimerButton = false;
    }

    private subscribeToStartMatch() {
        const startMatchSubscription = this.matchRoomService.startMatch$.subscribe((startMatch) => {
            this.startTimerButton = startMatch;
        });
        this.eventSubscriptions.push(startMatchSubscription);
    }

    private subscribeToGameTitle() {
        const gameTitleSubscription = this.matchRoomService.gameTitle$.subscribe((title) => {
            this.gameTitle = title;
        });

        this.eventSubscriptions.push(gameTitleSubscription);
    }

    private subscribeToBanishment() {
        const banishmentSubscription = this.matchRoomService.isBanned$.subscribe((isBanned) => {
            this.isBanned = isBanned;
        });

        this.eventSubscriptions.push(banishmentSubscription);
    }
}

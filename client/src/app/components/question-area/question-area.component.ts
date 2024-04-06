import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatchStatus, WarningMessage } from '@app/constants/feedback-messages';
import { MatchContext } from '@app/constants/states';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { MatchContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { QuestionType } from '@common/constants/question-types';
import { Subject, Subscription } from 'rxjs';
@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnDestroy {
    currentQuestion: Question;
    gameDuration: number;
    context: MatchContext;
    matchContext = MatchContext;
    isFirstQuestion: boolean = true;
    isCooldown: boolean = false;
    isRightAnswer: boolean = false;
    answerStyle: string = '';
    isQuitting: boolean = false;

    private eventSubscriptions: Subscription[];

    // Allow more constructor parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        public answerService: AnswerService,
        private readonly matchContextService: MatchContextService,
        private readonly notificationService: NotificationService,
    ) {}

    get time() {
        return this.timeService.time;
    }

    get matchRoomCode() {
        return this.matchRoomService.getRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
    }

    get players() {
        return this.matchRoomService.players;
    }

    get answerOptions(): typeof AnswerCorrectness {
        return AnswerCorrectness;
    }

    get contextOptions(): typeof MatchContext {
        return MatchContext;
    }

    get questionType(): typeof QuestionType {
        return QuestionType;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (document?.activeElement?.id === 'chat-input') return;

        if (event.key === 'Enter' && this.answerService.isSelectionEnabled) {
            this.submitAnswers();
            return;
        }
    }

    canDeactivate(): CanDeactivateType {
        if (this.isQuitting) return true;
        if (!this.matchRoomService.isHostPlaying) return true;
        if (this.matchRoomService.isResults) return true;
        if (this.matchContextService.getContext() === MatchContext.TestPage) {
            this.quitGame();
            return true;
        }

        const deactivateSubject = new Subject<boolean>();
        this.notificationService.openWarningDialog(WarningMessage.QUIT).subscribe((confirm: boolean) => {
            deactivateSubject.next(confirm);
            if (confirm) this.matchRoomService.disconnect();
        });
        return deactivateSubject;
    }

    getHistoryState() {
        return history.state;
    }

    ngOnInit(): void {
        this.resetStateForNewQuestion();
        // TODO: move somewhere else?
        this.answerService.playerScore = 0;
        this.context = this.matchContextService.getContext();
        if (this.isFirstQuestion) {
            this.currentQuestion = this.getHistoryState().question;
            this.gameDuration = this.getHistoryState().duration;
            this.isFirstQuestion = false;
        }

        this.listenToGameEvents();
        this.initialiseSubscriptions();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    submitAnswers(): void {
        this.answerService.submitAnswer({ username: this.username, roomCode: this.matchRoomCode });
        this.answerService.isSelectionEnabled = false;
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
        this.answerService.isNextQuestionButton = false;
    }

    routeToResultsPage() {
        this.matchRoomService.routeToResultsPage();
    }

    quitGame() {
        this.isQuitting = true;
        this.matchRoomService.disconnect();
    }

    togglePanicTimer() {
        this.timeService.panicTimer(this.matchRoomCode);
    }

    private handleQuestionChange(newQuestion: Question) {
        if (newQuestion) {
            this.currentQuestion = newQuestion;
            this.resetStateForNewQuestion();
        }
    }
    private subscribeToCurrentQuestion() {
        const currentQuestionSubscription = this.matchRoomService.currentQuestion$.subscribe((question) => {
            this.handleQuestionChange(question);
        });
        this.eventSubscriptions.push(currentQuestionSubscription);
    }

    private subscribeToCooldown() {
        const displayCoolDownSubscription = this.matchRoomService.displayCooldown$.subscribe((isCooldown) => {
            this.isCooldown = isCooldown;
            if (
                this.isCooldown &&
                !this.answerService.isEndGame &&
                this.context !== MatchContext.TestPage &&
                this.context !== MatchContext.RandomMode
            ) {
                this.currentQuestion.text = MatchStatus.PREPARE;
            }
        });
        this.eventSubscriptions.push(displayCoolDownSubscription);
    }

    // TODO: see if can be moved
    private listenToGameEvents() {
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();
        this.answerService.onFeedback();
        this.answerService.onBonusPoints();
        this.answerService.onEndGame();
        this.answerService.onTimesUp();
        this.answerService.onGradeAnswers();
        this.answerService.onNextQuestion();
        this.matchRoomService.onGameOver();
        this.matchRoomService.onRouteToResultsPage();
    }

    private initialiseSubscriptions() {
        this.subscribeToCurrentQuestion();
        this.subscribeToCooldown();
    }

    private resetStateForNewQuestion(): void {
        this.eventSubscriptions = [];
        this.isCooldown = false;
        this.isQuitting = false;
        this.answerService.resetStateForNewQuestion();
    }
}

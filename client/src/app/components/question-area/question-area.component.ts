import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatchStatus, WarningMessage } from '@app/constants/feedback-messages';
import { MatchContext } from '@app/constants/states';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { Feedback } from '@common/interfaces/feedback';
import { Subject, Subscription } from 'rxjs';
@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnDestroy {
    currentQuestion: Question;
    gameDuration: number;
    isSelectionEnabled: boolean;
    showFeedback: boolean;
    playerScore: number = 0;
    bonus: number;
    context: MatchContext;
    isHostPlaying: boolean = true;
    isFirstQuestion: boolean = true;
    isCooldown: boolean = false;
    isRightAnswer: boolean = false;
    answerCorrectness: AnswerCorrectness = AnswerCorrectness.WRONG;
    answerStyle: string = '';
    isNextQuestionButton: boolean = false;
    isLastQuestion: boolean = false;
    isQuitting: boolean = false;

    private eventSubscriptions: Subscription[];

    // Allow more constructor parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        private readonly questionContextService: QuestionContextService,
        private readonly answerService: AnswerService,
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

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (document?.activeElement?.id === 'chat-input') return;

        if (event.key === 'Enter' && this.isSelectionEnabled) {
            this.submitAnswers();
            return;
        }
    }

    canDeactivate(): CanDeactivateType {
        if (this.isQuitting) return true;
        if (!this.isHostPlaying) return true;
        if (this.matchRoomService.isResults) return true;
        if (this.questionContextService.getContext() === MatchContext.TestPage) {
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

        this.context = this.questionContextService.getContext();

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
        this.isSelectionEnabled = false;
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
        this.isNextQuestionButton = false;
    }

    routeToResultsPage() {
        this.matchRoomService.routeToResultsPage();
    }

    quitGame() {
        this.isQuitting = true;
        this.matchRoomService.disconnect();
    }

    private handleFeedback(feedback: Feedback) {
        this.showFeedback = true;
        this.isNextQuestionButton = true;

        if (feedback) {
            this.isSelectionEnabled = false;
            this.answerCorrectness = feedback.answerCorrectness;
            this.playerScore = feedback.score;
            // TODO: À revoir si chaque client renvoi son data...
            this.matchRoomService.sendPlayersData(this.matchRoomCode);

            if (this.context === MatchContext.TestPage) {
                this.nextQuestion();
            }
        }
    }

    private subscribeToFeedback() {
        const feedbackSubscription = this.answerService.feedback$.subscribe((feedback) => {
            this.handleFeedback(feedback);
        });
        this.eventSubscriptions.push(feedbackSubscription);
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

    private subscribeToBonus() {
        const bonusPointsSubscription = this.answerService.bonusPoints$.subscribe((bonus) => {
            if (bonus) {
                this.bonus = bonus;
            }
        });
        this.eventSubscriptions.push(bonusPointsSubscription);
    }

    private subscribeToCooldown() {
        const displayCoolDownSubscription = this.matchRoomService.displayCooldown$.subscribe((isCooldown) => {
            this.isCooldown = isCooldown;
            if (this.isCooldown && this.context !== MatchContext.TestPage) {
                this.currentQuestion.text = MatchStatus.PREPARE;
            }
        });
        this.eventSubscriptions.push(displayCoolDownSubscription);
    }

    private subscribeToGameEnd() {
        const endGameSubscription = this.answerService.endGame$.subscribe((endGame) => {
            this.isLastQuestion = endGame;
        });
        this.eventSubscriptions.push(endGameSubscription);
    }

    private subscribeToHostPlaying() {
        const hostPlayingSubscription = this.matchRoomService.isHostPlaying$.subscribe((isHostPlaying) => {
            this.isHostPlaying = isHostPlaying;
        });
        this.eventSubscriptions.push(hostPlayingSubscription);
    }

    private subscribeToTimesUp() {
        const timesUpSubscription = this.answerService.isTimesUp$.subscribe((isTimesUp) => {
            if (isTimesUp) this.isSelectionEnabled = false;
        });
        this.eventSubscriptions.push(timesUpSubscription);
    }

    private listenToGameEvents() {
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();
        this.answerService.onFeedback();
        this.answerService.onBonusPoints();
        this.answerService.onEndGame();
        this.answerService.onTimesUp();
        this.answerService.onGradeAnswers();
        this.matchRoomService.onGameOver();
        this.matchRoomService.onRouteToResultsPage();
    }

    private initialiseSubscriptions() {
        this.subscribeToHostPlaying();
        this.subscribeToFeedback();
        this.subscribeToCurrentQuestion();
        this.subscribeToTimesUp();
        this.subscribeToBonus();
        this.subscribeToCooldown();
        this.subscribeToGameEnd();
    }

    private resetStateForNewQuestion(): void {
        this.eventSubscriptions = [];
        this.isHostPlaying = true;
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.bonus = 0;
        this.answerCorrectness = AnswerCorrectness.WRONG;
        this.isCooldown = false;
        this.isQuitting = false;
    }
}

import { Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatchStatus } from '@app/constants/feedback-messages';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { MULTIPLICATION_FACTOR } from '@common/constants/match-constants';
import { Subject, Subscription } from 'rxjs';
@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnDestroy, OnChanges {
    currentQuestion: Question;
    gameDuration: number;
    answers: Choice[];
    selectedAnswers: Choice[];
    isSelectionEnabled: boolean;
    showFeedback: boolean;
    playerScore: number = 0;
    bonus: number;
    context: 'testPage' | 'hostView' | 'playerView';
    correctAnswers: string[];
    isFirstQuestion: boolean = true;
    isCooldown: boolean = false;
    isRightAnswer: boolean = false;
    isNextQuestionButton: boolean = false;
    isLastQuestion: boolean = false;

    private subscriptions: Subscription[];

    // permit more class parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly timeService: TimeService,
        private readonly matchService: MatchService,
        private readonly matchRoomService: MatchRoomService,
        private readonly questionContextService: QuestionContextService,
        private readonly answerService: AnswerService,
        private readonly notificationService: NotificationService,
    ) {}

    get time() {
        return this.timeService.time;
    }

    get matchRoomCode() {
        return this.matchRoomService.getMatchRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
    }

    get players() {
        return this.matchRoomService.players;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.isSelectionEnabled) {
            this.submitAnswers();
        } else {
            const numKey = parseInt(event.key, 5);
            if (numKey >= 1 && numKey <= this.answers.length) {
                const choiceIndex = numKey - 1;
                const choice = this.answers?.[choiceIndex];
                if (choice) {
                    this.selectChoice(choice);
                }
            }
        }
    }

    canDeactivate(): CanDeactivateType {
        const deactivateSubject = new Subject<boolean>();
        this.notificationService.openPendingChangesConfirmDialog().subscribe((confirm: boolean) => deactivateSubject.next(confirm));
        return deactivateSubject;
    }

    ngOnInit(): void {
        this.subscriptions = [];
        this.resetStateForNewQuestion();

        this.context = this.questionContextService.getContext();

        if (this.isFirstQuestion) {
            this.currentQuestion = history.state.question;
            this.gameDuration = history.state.duration;
            this.isFirstQuestion = false;
        }

        this.listenToGameEvents();
        this.initialiseSubscriptions();
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;
            if (this.currentQuestion.choices) {
                this.answers = this.currentQuestion.choices;
            }
            if (this.currentQuestion.id) {
                this.matchService.questionId = this.currentQuestion.id;
            }
            this.resetStateForNewQuestion();
        }
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.timeService.duration) * MULTIPLICATION_FACTOR;
    }

    submitAnswers(): void {
        this.answerService.submitAnswer({ username: this.username, roomCode: this.matchRoomCode });
        this.isSelectionEnabled = false;
    }

    selectChoice(choice: Choice): void {
        if (this.isSelectionEnabled) {
            if (!this.selectedAnswers.includes(choice)) {
                this.selectedAnswers.push(choice);
                if (this.context !== 'hostView') {
                    this.answerService.selectChoice(choice.text, { username: this.username, roomCode: this.matchRoomCode });
                }
            } else {
                this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
                if (this.context !== 'hostView') {
                    this.answerService.deselectChoice(choice.text, { username: this.username, roomCode: this.matchRoomCode });
                }
            }
        }
    }

    isSelected(choice: Choice): boolean {
        return this.selectedAnswers.includes(choice);
    }

    isCorrectAnswer(choice: Choice): boolean {
        return this.correctAnswers.includes(choice.text);
    }

    nextQuestion() {
        this.matchRoomService.nextQuestion();
        this.isNextQuestionButton = false;
    }

    resetStateForNewQuestion(): void {
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.selectedAnswers = [];
        this.bonus = 0;
        this.correctAnswers = [];
        this.isRightAnswer = false;
        this.isCooldown = false;
    }

    handleQuit() {
        this.matchRoomService.disconnect();
    }

    routeToResultsPage() {
        this.matchRoomService.routeToResultsPage();
    }

    private subscribeToFeedback() {
        const feedbackSubscription = this.answerService.feedback$.subscribe((feedback) => {
            if (feedback) {
                this.correctAnswers = feedback.correctAnswer;
                if (this.playerScore < feedback.score) {
                    this.isRightAnswer = true;
                }
                this.playerScore = feedback.score;
                this.matchRoomService.sendPlayersData(this.matchRoomCode);
                this.showFeedback = true;

                if (this.context === 'testPage') {
                    this.nextQuestion();
                }
            }
        });
        const feedbackObservable = this.answerService.feedbackSub$.subscribe(() => {
            this.showFeedback = true;
            this.isNextQuestionButton = true;
        });

        this.subscriptions.push(feedbackSubscription);
        this.subscriptions.push(feedbackObservable);
    }

    private subscribeToCurrentQuestion() {
        const currentQuestionSubscription = this.matchRoomService.currentQuestion$.subscribe((question) => {
            if (question) {
                this.currentQuestion = question;
                this.ngOnChanges({
                    currentQuestion: {
                        currentValue: question,
                        previousValue: this.currentQuestion,
                        firstChange: false,
                        isFirstChange: () => false,
                    },
                });
            }
        });
        this.subscriptions.push(currentQuestionSubscription);
    }

    private subscribeToBonus() {
        const bonusPointsSubscription = this.answerService.bonusPoints$.subscribe((bonus) => {
            if (bonus) {
                this.bonus = bonus;
            }
        });
        this.subscriptions.push(bonusPointsSubscription);
    }

    private subscribeToCooldown() {
        const displayCoolDownSubscription = this.matchRoomService.displayCooldown$.subscribe((isCooldown) => {
            if (isCooldown) {
                this.isCooldown = true;
                if (this.context !== 'testPage') this.currentQuestion.text = MatchStatus.PREPARE;
            }
        });

        this.subscriptions.push(displayCoolDownSubscription);
    }

    private subscribeToGameEnd() {
        const endGameSubscription = this.answerService.endGame$.subscribe(() => {
            this.isLastQuestion = true;
        });
        this.subscriptions.push(endGameSubscription);
    }

    private listenToGameEvents() {
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();
        this.answerService.feedback();
        this.answerService.bonusPoints();
        this.answerService.gameOver();
        this.matchRoomService.listenRouteToResultsPage();
    }

    private initialiseSubscriptions() {
        this.subscribeToFeedback();
        this.subscribeToCurrentQuestion();
        this.subscribeToBonus();
        this.subscribeToCooldown();
        this.subscribeToGameEnd();
    }
}

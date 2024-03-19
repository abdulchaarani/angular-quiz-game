import { Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatchStatus, WarningMessage } from '@app/constants/feedback-messages';
import { CanDeactivateType } from '@app/interfaces/can-component-deactivate';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { Feedback } from '@common/interfaces/feedback';
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
    isHostPlaying: boolean = true;
    isFirstQuestion: boolean = true;
    isCooldown: boolean = false;
    isRightAnswer: boolean = false;
    isNextQuestionButton: boolean = false;
    isLastQuestion: boolean = false;
    isQuitting: boolean = false;

    private eventSubscriptions: Subscription[];

    // Allow more constructor parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        public matchRoomService: MatchRoomService,
        public timeService: TimeService,
        private readonly matchService: MatchService,
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

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (document?.activeElement?.id === 'chat-input') return;

        if (event.key === 'Enter' && this.isSelectionEnabled) {
            this.submitAnswers();
            return;
        }

        const numKey = parseInt(event.key, 5);
        if (!numKey || !this.currentQuestion.choices) return;

        if (numKey >= 1 && numKey <= this.currentQuestion.choices.length) {
            const choiceIndex = numKey - 1;
            const choice = this.currentQuestion.choices[choiceIndex];
            if (choice) {
                this.selectChoice(choice);
            }
        }
    }

    canDeactivate(): CanDeactivateType {
        if (this.isQuitting) return true;
        if (!this.isHostPlaying) return true;
        if (this.matchRoomService.isResults) return true;
        if (this.questionContextService.getContext() === 'testPage') {
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
        this.eventSubscriptions = [];
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
        this.isHostPlaying = true;
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.selectedAnswers = [];
        this.bonus = 0;
        this.correctAnswers = [];
        this.isRightAnswer = false;
        this.isCooldown = false;
        this.isQuitting = false;
    }

    routeToResultsPage() {
        this.matchRoomService.routeToResultsPage();
    }

    quitGame() {
        this.isQuitting = true;
        this.matchRoomService.disconnect();
    }

    private handleFeedback(feedback: Feedback) {
        if (feedback) {
            this.isSelectionEnabled = false;
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
    }

    private subscribeToFeedback() {
        const feedbackSubscription = this.answerService.feedback$.subscribe((feedback) => {
            this.handleFeedback(feedback);
        });
        const feedbackChangeSubscription = this.answerService.isFeedback$.subscribe(() => {
            this.showFeedback = true;
            this.isNextQuestionButton = true;
        });

        this.eventSubscriptions.push(feedbackSubscription);
        this.eventSubscriptions.push(feedbackChangeSubscription);
    }

    private handleQuestionChange(question: Question) {
        if (question) {
            this.currentQuestion = question;
            this.ngOnChanges({
                currentQuestion: {
                    currentValue: question,
                    previousValue: this.currentQuestion,
                    firstChange: false,
                    isFirstChange: this.isFirstChangeFn,
                },
            });
        }
    }

    private isFirstChangeFn() {
        return false;
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
            if (this.isCooldown && this.context !== 'testPage') {
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

    private listenToGameEvents() {
        this.timeService.handleTimer();
        this.timeService.handleStopTimer();
        this.answerService.onFeedback();
        this.answerService.onBonusPoints();
        this.answerService.onEndGame();
        this.matchRoomService.onGameOver();
        this.matchRoomService.onRouteToResultsPage();
    }

    private initialiseSubscriptions() {
        this.subscribeToHostPlaying();
        this.subscribeToFeedback();
        this.subscribeToCurrentQuestion();
        this.subscribeToBonus();
        this.subscribeToCooldown();
        this.subscribeToGameEnd();
    }
}

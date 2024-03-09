import { HttpResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';

import { TimeService } from '@app/services/time/time.service';
@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnChanges {
    @Input() currentQuestion: Question;
    @Input() gameDuration: number;

    answers: Choice[];
    selectedAnswers: Choice[];
    isSelectionEnabled: boolean;
    showFeedback: boolean;
    isCorrect: boolean;
    playerScore: number;
    havePointsBeenAdded: boolean;
    bonus: number;
    context: 'testPage' | 'hostView' | 'playerView';
    correctAnswers: string[];

    readonly bonusFactor = 0.2;
    private readonly multiplicationFactor = 100;
    private readonly timeout = 3000;
    router: any;

    constructor(
        public timeService: TimeService,
        public dialog: MatDialog,
        private matchService: MatchService,
        private matchRoomService: MatchRoomService,
        private questionContextService: QuestionContextService,
        private answerService: AnswerService,
    ) {
        this.selectedAnswers = [];
        this.isSelectionEnabled = true;
        this.showFeedback = false;
        this.isCorrect = false;
        this.playerScore = 0;
        this.havePointsBeenAdded = false;
        this.bonus = 0;
        this.correctAnswers = [];
    }

    get time() {
        return this.timeService.time;
    }

    get matchRoomCode() {
        return this.matchRoomService.getMatchRoomCode();
    }

    get username() {
        return this.matchRoomService.getUsername();
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

    ngOnInit(): void {
        this.context = this.questionContextService.getContext();
        if (this.context !== 'testPage') {
            this.timeService.handleTimer();
            this.timeService.handleStopTimer();

            this.currentQuestion = history.state.question;
            this.gameDuration = history.state.duration;

            this.answerService.feedback();
            this.answerService.bonusPoints();

            this.answerService.feedback$.subscribe((feedback) => {
                if (feedback) {
                    this.correctAnswers = feedback.correctAnswer;
                    this.playerScore = feedback.score;
                    this.showFeedback = true;
                }
            });

            this.matchRoomService.currentQuestion$.subscribe((question) => {
                if (question) {
                    this.currentQuestion = question;
                }
            });

            this.answerService.bonusPoints$.subscribe((bonus) => {
                if (bonus) {
                    this.bonus = bonus;
                }
            });
        }

        if (this.currentQuestion.choices) {
            this.answers = this.currentQuestion.choices;
        }

        if (this.currentQuestion.id && this.context === 'testPage') {
            this.matchService.questionId = this.currentQuestion.id;
        }

        // this.timeService.timerFinished$.subscribe((timerFinished) => {
        //     if (timerFinished) {
        //         console.log('Timer finished');
        //     }
        // });
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
        return (this.timeService.time / this.gameDuration) * this.multiplicationFactor;
    }

    checkAnswers(): void {
        const choicesText: string[] = this.selectedAnswers.map((choice) => choice.text);
        this.matchService.validateChoices(choicesText).subscribe((response: HttpResponse<string>) => {
            if (response.body) {
                this.isCorrect = JSON.parse(response.body);
                this.afterFeedback();
            }
        });
    }

    submitAnswers(): void {
        this.isSelectionEnabled = false;
        if (this.context === 'testPage') {
            this.timeService.stopTimer(this.matchRoomCode);
            this.checkAnswers();
        } else {
            this.answerService.submitAnswer({ username: this.username, roomCode: this.matchRoomCode });
        }
    }

    selectChoice(choice: Choice): void {
        if (this.isSelectionEnabled) {
            if (!this.selectedAnswers.includes(choice)) {
                this.selectedAnswers.push(choice);
                if (this.context !== 'testPage') {
                    this.answerService.selectChoice(choice.text, { username: this.username, roomCode: this.matchRoomCode });
                }
            } else {
                this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
                if (this.context !== 'testPage') {
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

    playerScoreUpdate(): void {
        if (this.isCorrect) {
            if (this.context === 'testPage') {
                this.bonus = this.currentQuestion.points * this.bonusFactor;
                this.playerScore += this.currentQuestion.points;
                this.playerScore += this.bonus;
            } else if (this.context === 'playerView') {
                const updatedScore = this.matchRoomService.updatePlayerScore(this.username, this.currentQuestion.points);
                if (updatedScore !== void 0) {
                    this.playerScore = updatedScore;
                }
            }
        }
    }

    afterFeedback(): void {
        //TODO: uncomment when done
        // if (this.havePointsBeenAdded === false) {
        //     this.playerScoreUpdate();
        //     this.havePointsBeenAdded = true;
        // }
        this.showFeedback = true;
        setTimeout(() => {
            // this.matchService.advanceQuestion();
            // this.matchRoomService.nextQuestion();
            this.resetStateForNewQuestion();
            // this.timeService.stopTimer(this.matchRoomCode);
            // this.timeService.startTimer(this.matchRoomCode, this.gameDuration);
        }, this.timeout);
    }

    resetStateForNewQuestion(): void {
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.selectedAnswers = [];
        this.isCorrect = false;
        this.havePointsBeenAdded = false;
        this.bonus = 0;
        this.correctAnswers = [];
    }
    nextQuestion() {
        this.matchRoomService.nextQuestion();
    }
}

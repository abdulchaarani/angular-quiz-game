import { HttpResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatComponent } from '@app/components/chat/chat.component';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { MatchService } from '@app/services/match/match.service';
import { TimeService } from '@app/services/time/time.service';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnChanges {
    @Input() currentQuestion: Question;
    @Input() gameDuration: number;
    @Input() isTestPage: boolean;

    answers: Choice[];
    selectedAnswers: Choice[];
    isSelectionEnabled: boolean;
    showFeedback: boolean;
    isCorrect: boolean;
    playerScore: number;
    havePointsBeenAdded: boolean;
    bonus: number;

    readonly bonusFactor = 0.2;
    private readonly multiplicationFactor = 100;
    private readonly timeout = 3000;

    constructor(
        public timeService: TimeService,
        public dialog: MatDialog,
        private matchService: MatchService,
    ) {
        this.selectedAnswers = [];
        this.isSelectionEnabled = true;
        this.showFeedback = false;
        this.isCorrect = false;
        this.playerScore = 0;
        this.havePointsBeenAdded = false;
        this.bonus = 0;
    }

    get time() {
        return this.timeService.time;
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
        // this.timeService.stopTimer();
        // this.timeService.startTimer(this.gameDuration);
        if (this.currentQuestion.choices) {
            this.answers = this.currentQuestion.choices;
        }
        if (this.currentQuestion.id) {
            this.matchService.questionId = this.currentQuestion.id;
        }

        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                this.checkAnswers();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.gameDuration) {
            // const newTimeLimit = changes.gameDuration.currentValue;
            // this.timeService.startTimer(newTimeLimit);
        }

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
    }

    selectChoice(choice: Choice): void {
        if (this.isSelectionEnabled) {
            if (!this.selectedAnswers.includes(choice)) {
                this.selectedAnswers.push(choice);
            } else {
                this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
            }
        }
    }

    isSelected(choice: Choice): boolean {
        return this.selectedAnswers.includes(choice);
    }

    openChatDialog(): void {
        this.dialog.open(ChatComponent, {
            width: '50%',
            height: '50%',
        });
    }

    playerScoreUpdate(): void {
        if (this.isCorrect === true) {
            if (this.isTestPage === true) {
                this.bonus = this.currentQuestion.points * this.bonusFactor;
            }
            this.playerScore += this.currentQuestion.points;
            this.playerScore += this.bonus;
        }
    }

    afterFeedback(): void {
        if (this.havePointsBeenAdded === false) {
            this.playerScoreUpdate();
            this.havePointsBeenAdded = true;
        }
        this.showFeedback = true;
        setTimeout(() => {
            this.matchService.advanceQuestion();
            this.resetStateForNewQuestion();
            // this.timeService.stopTimer();
            // this.timeService.startTimer(this.gameDuration);
        }, this.timeout);
    }

    resetStateForNewQuestion(): void {
        this.showFeedback = false;
        this.isSelectionEnabled = true;
        this.selectedAnswers = [];
        this.isCorrect = false;
        this.havePointsBeenAdded = false;
        this.bonus = 0;
    }
}

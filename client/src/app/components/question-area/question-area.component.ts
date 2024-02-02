import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { GameEventService } from '@app/services/game-event.service';
import { TimeService } from '@app/services/time.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnChanges {
    @Input() currentQuestion: Question;
    @Input() gameDuration: number;

    answers: Choice[];
    selectedAnswers: Choice[] = [];
    isSelectionEnabled: boolean = true;
    showFeedback: boolean = false;
    isCorrect: boolean = false;
    playerScore: number = 0;

    private readonly multiplicationFactor = 100;

    constructor(
        public timeService: TimeService,
        public dialog: MatDialog,
        private gameEventService: GameEventService,
    ) {}

    get time() {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.stopTimer();
        this.timeService.startTimer(this.gameDuration);

        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                this.checkAnswers();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.gameDuration) {
            const newTimeLimit = changes.gameDuration.currentValue;
            this.timeService.startTimer(newTimeLimit);
        }

        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;
        }
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.gameDuration) * this.multiplicationFactor;
    }

    // submit(): void {}
    checkAnswers(): void {
        for (const answer of this.selectedAnswers) {
            if (answer.isCorrect) {
                this.isCorrect = true;
            } else {
                this.isCorrect = false;
                break;
            }
        }
        this.showFeedback = true;
    }

    submitAnswers(): void {
        this.isSelectionEnabled = false;
        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                this.checkAnswers();
            }
        });
    }
    // abandon(): void {}

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

    //open-chat-dialog(): void {}

    openChatDialog(): void {
        this.dialog.open(ChatComponent, {
            width: '50%',
            height: '50%',
        });
    }

    //exit-game(): void {}
    exitGame(): void {}

    onNextButtonClick(): void {
        if (this.isCorrect) {
            this.playerScore += this.currentQuestion.points;
        }
        this.resetStateForNewQuestion();
        this.gameEventService.advanceQuestion();
        this.timeService.stopTimer();
        this.timeService.startTimer(this.gameDuration);
    }

    resetStateForNewQuestion(): void {
        this.isSelectionEnabled = true;
        this.selectedAnswers = [];
        this.isCorrect = false;
        this.showFeedback = false;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.isSelectionEnabled) {
            this.submitAnswers();
        } else {
            const numKey = parseInt(event.key);
            if (numKey >= 1 && numKey <= (this.currentQuestion.choices?.length || 0)) {
                this.toggleChoice(numKey - 1);
            }
        }
    }

    toggleChoice(index: number): void {
        if (!this.isSelectionEnabled) return;
        if (!this.currentQuestion || !this.currentQuestion.choices) return;

        const choice = this.currentQuestion.choices[index];
        if (this.selectedAnswers.includes(choice)) {
            this.selectedAnswers = this.selectedAnswers.filter((c) => c !== choice);
        } else {
            this.selectedAnswers.push(choice);
        }
    }
}

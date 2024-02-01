import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
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

    private readonly multiplicationFactor = 100;

    constructor(
        public timeService: TimeService,
        public dialog: MatDialog,
    ) {}

    get time() {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.startTimer(this.gameDuration);

        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                // this.router.navigate(['/home']); // TODO : navigate to gamelist page
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
    checkAnswers(): boolean {
        let isCorrect = false;
        for (const answer of this.selectedAnswers) {
            if (answer.isCorrect) {
                isCorrect = true;
            } else {
                isCorrect = false;
                break;
            }
        }

        console.log(isCorrect);
        return isCorrect;
    }

    submitAnswers(): void {
        this.timeService.stopTimer();
        this.isSelectionEnabled = false;
        this.checkAnswers();
    }
    // abandon(): void {}

    selectChoice(choice: Choice): void {
        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (!timerFinished && this.isSelectionEnabled) {
                if (!this.selectedAnswers.includes(choice)) {
                    this.selectedAnswers.push(choice);
                    console.log(this.selectedAnswers);
                } else {
                    this.selectedAnswers = this.selectedAnswers.filter((answer) => answer !== choice);
                    console.log(this.selectedAnswers);
                }
            }
        });
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
}

import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit, OnChanges {
    @Input() currentQuestion: Question;
    @Input() gameDuration: number;
    answers: Choice[];

    private readonly multiplicationFactor = 100;

    constructor(public timeService: TimeService) {}

    get time() {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.startTimer(this.gameDuration);

        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                // this.router.navigate(['/home']); // TODO : navigate to gamelist page
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
    checkAnswers(isCorrect?: boolean): void {
        console.log(isCorrect);
    }
    // abandon(): void {}
}

import { Component, Input, OnInit } from '@angular/core';
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit {
    @Input() currentQuestion: Question;
    timeLimit: number;
    playerScore: number;
    answers: Choice[];

    private readonly questionTimeLimit = 3;
    private readonly multiplicationFactor = 100;

    constructor(public timeService: TimeService) {
        this.timeLimit = this.questionTimeLimit;
    }

    get time(): number {
        return this.timeService.time;
    }

    set timerLimit(time: number) {
        this.timeLimit = time;
    }

    ngOnInit(): void {
        // TEMP

        this.timeService.timerFinished$.subscribe((timerFinished) => {
            if (timerFinished) {
                // this.router.navigate(['/home']); // TODO : navigate to gamelist page
                // console.log(this.timeService.timerFinished$.value);
                // console.log(this.questions);
            }
        });
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.timeLimit) * this.multiplicationFactor;
    }

    // submit(): void {}
    // checkAnswers(): void {}
    // abandon(): void {}
}

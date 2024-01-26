import { Component, OnInit } from '@angular/core';
import { TimeService } from '@app/services/time.service';
// import { Question } from '@app/interfaces/question';
import { Choice } from '@app/interfaces/choice';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent implements OnInit {
    currentGame: Game;
    currentQuestionIndex: number;
    playerScore: number;
    answers: Choice[];

    private readonly timeLimit = 60;
    private readonly multiplicationFactor = 100;

    constructor(private readonly timeService: TimeService) {}

    get time(): number {
        return this.timeService.time;
    }

    // TODO : Timer
    ngOnInit(): void {
        this.timeService.startTimer(this.timeLimit);

        this.timeService.timerFinished$.subscribe(() => {
            // console.log('times up');
        });
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.timeLimit) * this.multiplicationFactor;
    }

    // submit(): void {}
    // checkAnswers(): void {}
    // abandon(): void {}
}

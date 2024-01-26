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
    constructor(private readonly timeService: TimeService) {}

    currentGame: Game;
    currentQuestionIndex: number;
    playerScore: number;
    answers: Choice[];

    // TODO : Timer
    ngOnInit(): void {
        this.timeService.startTimer(this.timeLimit);

        this.timeService.timerFinished$.subscribe(() => {
            console.log('times up');
        });
    }

    get time(): number {
        return this.timeService.time;
    }

    computeTimerProgress(): number {
        return (this.timeService.time / 60) * 100;
    }

    submit(): void {}
    checkAnswers(): void {}
    abandon(): void {}
}

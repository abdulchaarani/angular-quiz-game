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
    timeLimit: number;
    playerScore: number;
    answers: Choice[];

    private readonly questionTimeLimit = 60;
    private readonly multiplicationFactor = 100;

    constructor(public timeService: TimeService) {
        this.timeLimit = this.questionTimeLimit;
    }

    get time(): number {
        return this.timeService.time;
    }

    ngOnInit(): void {
        this.timeService.startTimer(this.timeLimit);
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.timeLimit) * this.multiplicationFactor;
    }

    // submit(): void {}
    // checkAnswers(): void {}
    // abandon(): void {}
}

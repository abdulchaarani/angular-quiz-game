import { Component } from '@angular/core';
// import { TimeService } from '@app/services/time.service';
// import { Question } from '@app/interfaces/question';
import { Choice } from '@app/interfaces/choice';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-question-area',
    templateUrl: './question-area.component.html',
    styleUrls: ['./question-area.component.scss'],
})
export class QuestionAreaComponent {
    // constructor( private timer : TimeService){}

    currentGame: Game;
    currentQuestionIndex: number;
    playerScore: number;
    answers: Choice[];

    // TODO : Timer

    submit(): void {}
    checkAnswers(): void {}
    abandon(): void {}
}

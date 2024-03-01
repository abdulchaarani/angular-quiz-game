import { Component } from '@angular/core';
import { getMockQuestion } from '@app/constants/question-mocks';
import { Question } from '@app/interfaces/question';
import { TimeService } from '@app/services/time.service';

const DURATION = 10000;
@Component({
    selector: 'app-host-question-area',
    templateUrl: './host-question-area.component.html',
    styleUrls: ['./host-question-area.component.scss'],
})
export class HostQuestionAreaComponent {
    // @Input() gameDuration: number;
    // currentQuestion: Question;

    currentQuestion: Question = getMockQuestion();
    gameDuration: number = DURATION;

    private readonly multiplicationFactor = 100;
    constructor(public timeService: TimeService) {}

    get time() {
        return this.timeService.time;
    }

    computeTimerProgress(): number {
        return (this.timeService.time / this.gameDuration) * this.multiplicationFactor;
    }
}

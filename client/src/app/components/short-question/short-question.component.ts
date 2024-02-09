import { Component, Input } from '@angular/core';
import { Question } from '@app/interfaces/question';

enum PointRange {
    Low = 10,
    Medium = 30,
    High = 50,
}

@Component({
    selector: 'app-short-question',
    templateUrl: './short-question.component.html',
    styleUrls: ['./short-question.component.scss'],
})
export class ShortQuestionComponent {
    @Input() question: Question;

    getPointsColor(): string {
        if (this.question.points >= PointRange.High) {
            return 'high-points';
        } else if (this.question.points >= PointRange.Medium) {
            return 'medium-points';
        } else {
            return 'low-points';
        }
    }
}

import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-feedback',
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent {
    @Input() isCorrect: boolean;
    // @Input() score: number;
    // @Input() bonus: string;
}

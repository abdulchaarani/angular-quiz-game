import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-question-list-item',
    templateUrl: './question-list-item.component.html',
    styleUrls: ['./question-list-item.component.scss'],
})
export class QuestionListItemComponent {
    @Input() question: Question;
    @Input() index: number;
    @Input() isLastModifiedDateVisible: boolean;
    @Input() isEditable: boolean;
    @Output() deleteQuestionEvent = new EventEmitter<string>();

    deleteQuestion() {
        this.deleteQuestionEvent.emit(this.question.id);
    }
}

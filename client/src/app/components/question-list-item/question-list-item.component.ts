import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '@app/interfaces/question';
// import { QuestionService } from '@app/services/question.service';
// import { HttpResponse } from '@angular/common/http';

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
    @Output() questionUpdated = new EventEmitter<Question>();

    response: string = '';

    isCreateQuestionComponent: boolean = false;

    questions: Question[] = [];

    isPanelExpanded: boolean = false;

    togglePanel() {
        this.isPanelExpanded = !this.isPanelExpanded;
    }

    deleteQuestion() {
        this.deleteQuestionEvent.emit(this.question.id);
    }

    closeComponent() {
        this.questionUpdated.emit(this.question);
    }
}

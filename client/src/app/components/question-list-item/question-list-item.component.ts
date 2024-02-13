import { Component, Input, Output, EventEmitter } from '@angular/core';
import { QuestionManagementState } from '@app/constants/states';
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

    questions: Question[] = [];
    isCreateQuestionComponent: boolean = false;
    isPanelExpanded: boolean = false;
    modificationState: QuestionManagementState = QuestionManagementState.Modify;

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

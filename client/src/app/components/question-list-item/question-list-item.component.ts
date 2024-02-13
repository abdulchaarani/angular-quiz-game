import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { QuestionManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';
// import { QuestionService } from '@app/services/question.service';
// import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-question-list-item',
    templateUrl: './question-list-item.component.html',
    styleUrls: ['./question-list-item.component.scss'],
})
export class QuestionListItemComponent implements OnInit {
    @Input() question: Question;
    @Input() index: number;
    @Input() isBankQuestion: boolean;
    @Output() deleteQuestionEvent = new EventEmitter<string>();
    @Output() questionUpdated = new EventEmitter<Question>();

    questions: Question[] = [];
    isCreateQuestionComponent: boolean = false;
    isPanelExpanded: boolean = false;

    modificationState: QuestionManagementState;

    ngOnInit() {
        this.modificationState = this.isBankQuestion ? QuestionManagementState.BankModify : QuestionManagementState.GameModify;
    }

    togglePanel() {
        this.isPanelExpanded = !this.isPanelExpanded;
    }

    deleteQuestion() {
        this.deleteQuestionEvent.emit(this.question.id);
    }

    dispatchNewQuestion(newQuestion: Question) {
        this.questionUpdated.emit(newQuestion);
    }
}

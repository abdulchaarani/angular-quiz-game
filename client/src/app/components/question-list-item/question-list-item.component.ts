import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { QuestionManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';

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
    @Output() updateQuestionEvent = new EventEmitter<Question>();

    questions: Question[] = [];
    modificationState: QuestionManagementState;

    ngOnInit() {
        this.modificationState = this.isBankQuestion ? QuestionManagementState.BankModify : QuestionManagementState.GameModify;
    }

    deleteQuestion() {
        this.deleteQuestionEvent.emit(this.question.id);
    }

    dispatchModifiedQuestion() {
        this.updateQuestionEvent.emit(this.question);
    }
}

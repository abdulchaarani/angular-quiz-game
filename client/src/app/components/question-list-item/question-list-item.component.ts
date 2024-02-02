import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question.service';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-question-list-item',
    templateUrl: './question-list-item.component.html',
    styleUrls: ['./question-list-item.component.scss'],
})
export class QuestionListItemComponent {
    @Input() question: Question;
    @Input() isLastModifiedDateVisible: boolean;
    @Output() deleteQuestionEvent = new EventEmitter<string>();

    response: string = '';

    constructor(private readonly questionService: QuestionService) {}
    
    questions: Question[] = [];

    deleteQuestion() {
        this.deleteQuestionEvent.emit(this.question.id);
    }

    addQuestion() {
        this.questionService.saveQuestion(this.questions[0]).subscribe((response: HttpResponse<string>) => {
            this.response = response.statusText;
        });

    }

    onPointsChanged(newPoints: number) { // to update the pts, will probably remove since it's not used 
        this.questions[0].points = newPoints;
    }
}

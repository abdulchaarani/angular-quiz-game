import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question.service';
import { HttpResponse } from '@angular/common/http';
// import { map } from 'rxjs/operators';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
    sortAscending: string = '';

    questions: Question[] = [];

    response: string = '';

    constructor(private readonly questionService: QuestionService) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.questionService.getAllQuestions().subscribe((data: Question[]) => (this.questions = [...data]));
    }

    deleteQuestion(questionId: string) {
        this.questionService.deleteQuestion(questionId).subscribe((response: HttpResponse<string>) => {
            if (response.ok) this.questions = this.questions.filter((question: Question) => question.id !== questionId);
        });
    }

    addQuestion() {
        this.questionService.createQuestion(this.questions[0]).subscribe((response: HttpResponse<string>) => {
            this.response = response.statusText;
        });
    }
}

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/question.service';
// import { map } from 'rxjs/operators';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
    sortAscending: string = '';

    questions: Question[] = [];

    constructor(private readonly questionService: QuestionService) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.questionService.getAllQuestions().subscribe((data: Question[]) => (this.questions = data));
    }
}

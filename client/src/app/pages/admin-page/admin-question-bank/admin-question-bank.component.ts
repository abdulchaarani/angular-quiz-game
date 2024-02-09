// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
    sortAscending: string = '';

    questions: Question[] = [];

    response: string = '';
    newQuestion: Question = {
        id: 'X',
        type: 'QCM',
        text: 'Quelle est la capitale du canada?',
        points: 20,
        lastModification: '2024-01-26T14:21:19+00:00',
    };

    constructor(
        private readonly questionService: QuestionService,
        private readonly notificationService: NotificationService,
    ) {}

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }

    ngOnInit() {
        this.questionService.getAllQuestions().subscribe({
            next: (data: Question[]) => (this.questions = [...data]),
            error: (error: HttpErrorResponse) =>
                this.notificationService.displayErrorMessage(`Échec d'obtention des questions 😿\n ${error.message}`),
        });
    }

    deleteQuestion(questionId: string) {
        this.questionService.deleteQuestion(questionId).subscribe({
            next: () => (this.questions = this.questions.filter((question: Question) => question.id !== questionId)),
            error: (error: HttpErrorResponse) =>
                this.notificationService.displayErrorMessage(`Échec de supression de la question 😿\n ${error.message}`),
        });
    }

    addQuestion(newQuestion: Question = this.newQuestion) {
        this.questionService.createQuestion(newQuestion).subscribe({
            next: () => {
                this.questions.unshift(newQuestion);
                this.notificationService.displaySuccessMessage('Question ajoutée avec succès! 😺');
            },
            error: (error: HttpErrorResponse) =>
                this.notificationService.displayErrorMessage(`La question n'a pas pu être supprimée. 😿 \n ${error.message}`),
        });
    }
}

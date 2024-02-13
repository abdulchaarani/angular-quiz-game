// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Question } from '@app/interfaces/question';
import { CreateQuestionComponent } from '@app/pages/create-question/create-question.component';
import { NotificationService } from '@app/services/notification.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
    sortAscending: string = '';
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();
    @Input() createNewQuestionButton: boolean = false;
    @Input() createNewQuestionToBankButton: boolean = false;

    questions: Question[] = [];

    response: string = '';
    newQuestion: Question = {
        id: 'X',
        type: 'QCM',
        text: 'Quelle est la capitale du canada?',
        points: 20,
        lastModification: '2024-01-26T14:21:19+00:00',
    };
    dialogState: unknown;

    constructor(
        public dialog: MatDialog,
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
                this.notificationService.displayErrorMessage(`La question n'a pas pu être ajoutée. 😿 \n ${error.message}`),
        });
    }

    updateQuestion(newQuestion: Question) {
        this.questionService.updateQuestion(newQuestion).subscribe({
            next: () => {
            },
            error: (error: HttpErrorResponse) =>
                this.notificationService.displayErrorMessage(`La question n'a pas pu être modifiée. 😿 \n ${error.message}`),
        });
    }

    createNewQuestionBank(newQuestion: Question) {
        this.createQuestionEventQuestionBank.subscribe((newQuestion: Question) => {
            if (newQuestion) {
                this.questions.push(newQuestion);
            }
        });
    }

    openDialog() {
        if (!this.dialogState) {
            const dialogRef = this.dialog.open(CreateQuestionComponent, {
                height: '70%',
                width: '100%',
                // data: {
                //     createNewQuestionToBankButton: false,
                //     createNewQuestionButton: true,
                // },
            });

            dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                if (newQuestion) {
                    this.addQuestion(newQuestion);
                    dialogRef.close();
                }
                this.dialogState = false;
            });
        }
    }
}

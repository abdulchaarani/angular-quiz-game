import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManagementState } from '@app/constants/states';
import { BankStatus } from '@app/constants/feedback-messages';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
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

    ngOnInit() {
        this.questionService.getAllQuestions().subscribe({
            next: (data: Question[]) => (this.questions = [...data]),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.UNRETRIEVED}\n ${error.message}`),
        });
    }

    deleteQuestion(questionId: string) {
        this.questionService.deleteQuestion(questionId).subscribe({
            next: () => (this.questions = this.questions.filter((question: Question) => question.id !== questionId)),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.STILL}\n ${error.message}`),
        });
    }

    addQuestion(newQuestion: Question = this.newQuestion) {
        this.questionService.createQuestion(newQuestion).subscribe({
            next: (response: HttpResponse<string>) => {
                if (response.body) {
                    newQuestion = JSON.parse(response.body);
                    this.questions.push(newQuestion);
                    this.notificationService.displaySuccessMessage(BankStatus.SUCCESS);
                }
            },
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.STILL}\n ${error.message}`),
        });
    }

    updateQuestion(newQuestion: Question) {
        if (!this.isDuplicateQuestion(newQuestion, this.questions)) {
            this.questionService.updateQuestion(newQuestion).subscribe({
                next: () => {
                    this.notificationService.displaySuccessMessage(BankStatus.MODIFIED);
                },
                error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.UNMODIFIED} \n ${error.message}`),
            });
        } else {
            this.notificationService.displayErrorMessage(BankStatus.DUPLICATE);
        }
    }

    openDialog() {
        if (!this.dialogState) {
            const dialogRef = this.questionService.openCreateQuestionModal(ManagementState.BankCreate);

            dialogRef.componentInstance.createQuestionEvent.subscribe((newQuestion: Question) => {
                if (newQuestion) {
                    this.addQuestion(newQuestion);
                    dialogRef.close();
                }
                this.dialogState = false;
            });
        }
    }

    private isDuplicateQuestion(newQuestion: Question, questionList: Question[]): boolean {
        return !!questionList.find((question) => question.text === newQuestion.text && question.id !== newQuestion.id);
    }
}

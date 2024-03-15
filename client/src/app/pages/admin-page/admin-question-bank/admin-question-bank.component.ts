import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';
import { BankService } from '@app/services/bank/bank.service';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit {
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();
    @Input() createNewQuestionButton: boolean = false;
    @Input() createNewQuestionToBankButton: boolean = false;

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
        public readonly bankService: BankService,
        private readonly questionService: QuestionService,
    ) {}

    ngOnInit() {
        this.bankService.getAllQuestions();
    }

    deleteQuestion(questionId: string) {
        this.bankService.deleteQuestion(questionId);
    }

    addQuestion(newQuestion: Question = this.newQuestion) {
        this.bankService.addQuestion(newQuestion);
    }

    updateQuestion(newQuestion: Question) {
        this.bankService.updateQuestion(newQuestion);
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
}

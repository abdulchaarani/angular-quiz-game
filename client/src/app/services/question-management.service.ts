import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { NotificationService } from './notification.service';
import { QuestionManagementState } from '@app/constants/states';

@Injectable({
    providedIn: 'root',
})
export class QuestionManagementService {
    questionObservable: Observable<Question>;
    private questionSource = new Subject<Question>();
    constructor(private readonly notificationService: NotificationService) {
        this.questionObservable = this.questionSource.asObservable();
    }

    setQuestion(newQuestion: Question) {
        this.questionSource.next(newQuestion);
    }

    async openDialog() {
        // if (!this.dialogState) {
        const dialogref = this.notificationService.openCreateQuestionModal(QuestionManagementState.BankCreate);
        const t = await firstValueFrom(this.questionObservable);
        dialogref.close();
        console.log(t);
        return t;
        // return await firstValueFrom(t);
        // this.dialogState = false;
    }
}

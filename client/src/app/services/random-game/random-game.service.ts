import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BankStatus } from '@app/constants/feedback-messages';
import { Question } from '@app/interfaces/question';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionService } from '@app/services/question/question.service';

@Injectable({
    providedIn: 'root',
})
export class RandomGameService {
    allBankQuestions: Question[] = [];
    MINIMUM_QUESTIONS: number = 5;
    constructor(
        private readonly questionService: QuestionService,
        private readonly notificationService: NotificationService,
    ) {}

    getAllQuestions(): void {
        this.questionService.getAllQuestions().subscribe({
            next: (data: Question[]) => (this.allBankQuestions = [...data]),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`${BankStatus.UNRETRIEVED}\n ${error.message}`),
        });
    }

    isRandomGameAvailable(): boolean {
        return this.allBankQuestions.length >= this.MINIMUM_QUESTIONS;
    }

    getRandomQuestions(): Question[] {
        if (this.isRandomGameAvailable()) {
            const randomQuestions: Question[] = [];
            while (randomQuestions.length < this.MINIMUM_QUESTIONS) {
                const randomIndex: number = Math.floor(Math.random() * this.allBankQuestions.length);
                const randomQuestion: Question = this.allBankQuestions[randomIndex];
                if (!randomQuestions.includes(randomQuestion)) {
                    randomQuestions.push(randomQuestion);
                }
            }
            return randomQuestions;
        }
        return [];
    }
}

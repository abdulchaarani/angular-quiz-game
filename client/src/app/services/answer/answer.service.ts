import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { ChoiceInfo } from '@common/interfaces/choice-info';
import { Feedback } from '@common/interfaces/feedback';
import { UserInfo } from '@common/interfaces/user-info';
import { Observable, Subject } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    feedback$: Observable<Feedback>;
    isFeedback$: Observable<boolean>;
    bonusPoints$: Observable<number>;
    endGame$: Observable<boolean>;

    private isFeedbackSource: Subject<boolean>;
    private feedbackSource: Subject<Feedback>;
    private bonusPointsSubject: Subject<number>;
    private endGameSubject: Subject<boolean>;

    constructor(public socketService: SocketHandlerService) {
        this.initialiseAnwserSubjects();
    }

    selectChoice(choice: string, userInfo: UserInfo) {
        const choiceInfo: ChoiceInfo = { choice, userInfo };
        this.socketService.send('selectChoice', choiceInfo);
    }

    deselectChoice(choice: string, userInfo: UserInfo) {
        const choiceInfo: ChoiceInfo = { choice, userInfo };
        this.socketService.send('deselectChoice', choiceInfo);
    }

    submitAnswer(userInfo: UserInfo) {
        this.socketService.send('submitAnswer', userInfo);
    }

    onFeedback() {
        this.socketService.on('feedback', (data: Feedback) => {
            this.feedbackSource.next(data);
            this.isFeedbackSource.next(true);
        });
    }

    onBonusPoints() {
        this.socketService.on('bonus', (data: number) => {
            this.bonusPointsSubject.next(data);
        });
    }

    onEndGame() {
        this.socketService.on('endGame', () => {
            this.endGameSubject.next(true);
        });
    }

    private initialiseAnwserSubjects() {
        this.feedbackSource = new Subject<Feedback>();
        this.bonusPointsSubject = new Subject<number>();
        this.isFeedbackSource = new Subject<boolean>();
        this.endGameSubject = new Subject<boolean>();
        this.feedback$ = this.feedbackSource.asObservable();
        this.bonusPoints$ = this.bonusPointsSubject.asObservable();
        this.isFeedback$ = this.isFeedbackSource.asObservable();
        this.endGame$ = this.endGameSubject.asObservable();
    }
}

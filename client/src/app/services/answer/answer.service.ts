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
    feedbackSub$: Observable<void>;
    bonusPoints$: Observable<number>;
    endGame$: Observable<void>;

    private feedbackSubject: Subject<void>;
    private feedbackSource: Subject<Feedback>;
    private bonusPointsSubject: Subject<number>;
    private endGameSubject: Subject<void>;

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

    feedback() {
        this.socketService.on('feedback', (data: Feedback) => {
            this.feedbackSource.next(data);
            this.feedbackSubject.next();
        });
    }

    bonusPoints() {
        this.socketService.on('bonus', (data: number) => {
            this.bonusPointsSubject.next(data);
        });
    }

    gameOver() {
        this.socketService.on('endGame', () => {
            this.endGameSubject.next();
        });
    }

    private initialiseAnwserSubjects() {
        this.feedbackSource = new Subject<Feedback>();
        this.bonusPointsSubject = new Subject<number>();
        this.feedbackSubject = new Subject<void>();
        this.endGameSubject = new Subject<void>();
        this.feedback$ = this.feedbackSource.asObservable();
        this.bonusPoints$ = this.bonusPointsSubject.asObservable();
        this.feedbackSub$ = this.feedbackSubject.asObservable();
        this.endGame$ = this.endGameSubject.asObservable();
    }
}

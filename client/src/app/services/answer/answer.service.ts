import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Feedback } from '@common/interfaces/feedback';
import { Observable, Subject } from 'rxjs';
interface UserInfo {
    roomCode: string;
    username: string;
}
interface ChoiceInfo {
    userInfo: UserInfo;
    choice: string;
}
@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    feedback$: Observable<Feedback>;
    bonusPoints$: Observable<number>;
    private feedbackSource: Subject<Feedback>;
    private bonusPointsSubject: Subject<number>;

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
        this.socketService.on('feedback', (data: Feedback) => this.feedbackSource.next(data));
    }

    bonusPoints() {
        this.socketService.on('bonus', (data: number) => {
            this.bonusPointsSubject.next(data);
        });
    }

    private initialiseAnwserSubjects() {
        this.feedbackSource = new Subject<Feedback>();
        this.bonusPointsSubject = new Subject<number>();
        this.feedback$ = this.feedbackSource.asObservable();
        this.bonusPoints$ = this.bonusPointsSubject.asObservable();
    }
}

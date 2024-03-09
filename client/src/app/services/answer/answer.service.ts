import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
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
    private feedbackSource = new BehaviorSubject<any>(null);
    public feedback$ = this.feedbackSource.asObservable();

    private bonusPointsSubject = new BehaviorSubject<any>(null);
    public bonusPoints$ = this.bonusPointsSubject.asObservable();

    constructor(public socketService: SocketHandlerService) {}

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
        this.socketService.on('feedback', (data) => this.feedbackSource.next(data));
    }

    bonusPoints() {
        this.socketService.on('bonus', (data: any) => {
            this.bonusPointsSubject.next(data);
        });
    }
}

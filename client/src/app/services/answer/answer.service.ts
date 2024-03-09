import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    private feedbackSource = new BehaviorSubject<any>(null);
    public feedback$ = this.feedbackSource.asObservable();

    private bonusPointsSubject = new BehaviorSubject<any>(null);
    public bonusPoints$ = this.bonusPointsSubject.asObservable();

    constructor(public socketService: SocketHandlerService) {}

    selectChoice(choice: string, userInfo: any) {
        this.socketService.send('selectChoice', { choice, userInfo });
    }

    deselectChoice(choice: string, userInfo: any) {
        this.socketService.send('deselectChoice', { choice, userInfo });
    }

    submitAnswer(userInfo: any) {
        this.socketService.send('submitAnswer', { userInfo });
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

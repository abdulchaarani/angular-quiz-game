import { Injectable } from '@angular/core';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class AnswerService {
    constructor(public socketService: SocketHandlerService) {}

    selectChoice(choice: string, userInfo: any) {
        this.socketService.send('selectChoice', { choice, userInfo });
    }

    deselectChoice(choice: string, userInfo: any) {
        this.socketService.send('deselectChoice', { choice, userInfo });
    }

    submitAnswer(userInfo: any) {
        console.log('submitAnswer', { userInfo });
        this.socketService.send('submitAnswer', { userInfo });
    }
}

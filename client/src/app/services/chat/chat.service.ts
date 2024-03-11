import { Injectable } from '@angular/core';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
import { Message } from '@app/interfaces/message';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

interface sentData {
    roomCode: string;
    message: Message;
}

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private matchRoomCode: string;
    public message: Message;

    constructor(
        private socketHandler: SocketHandlerService,
        readonly matchRoomService: MatchRoomService,
    ) {
        this.socketHandler.on('newMessage', (data: sentData) => {
            this.matchRoomService.messages.push(data.message);
        });
    }

    getMatchRoomCode() {
        return this.matchRoomCode;
    }

    sendMessage(roomCode: string, message: Message): void {
        const sentData: sentData = { roomCode, message };
        this.socketHandler.send('roomMessage', sentData);
    }

    sendMessagesHistory(roomCode: string) {
        this.socketHandler.send('sendMessagesHistory', roomCode);
    }

    fetchOldMessages() {
        this.socketHandler.on('fetchOldMessages', (res: Message[]) => {
            this.matchRoomService.messages = res;
        });
    }

    displayOldMessages() {
        this.fetchOldMessages();
        this.sendMessagesHistory(this.matchRoomService.getMatchRoomCode());
    }
}

//https://stackoverflow.com/questions/26091844/calling-on-before-emit-in-event-emitter-is-there-a-timing-issue

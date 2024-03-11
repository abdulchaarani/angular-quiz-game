import { Injectable } from '@angular/core';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Message } from '@app/interfaces/message';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

interface SentData {
    roomCode: string;
    message: Message;
}

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(
        private socketHandler: SocketHandlerService,
        readonly matchRoomService: MatchRoomService,
    ) {}

    sendMessage(roomCode: string, message: Message): void {
        const sentData: SentData = { roomCode, message };
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

    handleReceivedMessages() {
        this.socketHandler.on('newMessage', (data: SentData) => {
            this.matchRoomService.messages.push(data.message);
        });
    }
}

// https://stackoverflow.com/questions/26091844/calling-on-before-emit-in-event-emitter-is-there-a-timing-issue

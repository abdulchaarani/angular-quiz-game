import { Injectable } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { MessageInfo } from '@common/interfaces/message-info';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(
        public socketHandler: SocketHandlerService,
        readonly matchRoomService: MatchRoomService,
    ) {}

    sendMessage(roomCode: string, message: Message): void {
        const messageInfo: MessageInfo = { roomCode, message };
        this.socketHandler.send('roomMessage', messageInfo);
    }

    sendMessagesHistory(roomCode: string) {
        this.socketHandler.send('sendMessagesHistory', roomCode);
    }

    fetchOldMessages() {
        this.socketHandler.on('fetchOldMessages', (messages: Message[]) => {
            this.matchRoomService.messages = messages;
        });
    }

    displayOldMessages() {
        this.fetchOldMessages();
        this.sendMessagesHistory(this.matchRoomService.getMatchRoomCode());
    }

    handleReceivedMessages() {
        this.socketHandler.on('newMessage', (messageInfo: MessageInfo) => {
            this.matchRoomService.messages.push(messageInfo.message);
        });
    }
}

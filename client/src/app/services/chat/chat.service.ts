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
    private matchRoomCode: string; //
    private message: Message;
    messages: Map<string, Message[]> = new Map();

    constructor(
        private socketHandler: SocketHandlerService,
        readonly matchRoomService: MatchRoomService,
    ) {
        this.matchRoomCode = '';
        this.message = { author: '', text: '', date: new Date() };
        this.socketHandler.on('newMessage', (data: sentData) => {
            const roomMessages = this.messages.get(data.roomCode) || [];
            roomMessages.push(data.message);
            this.messages.set(data.roomCode, roomMessages);
        });
    }

    get socketId() {
        return this.socketHandler.socket.id ? this.socketHandler.socket.id : '';
    }

    connect() {
        if (!this.socketHandler.isSocketAlive()) {
            this.socketHandler.connect();
            this.fetchOldMessages();
        }
    }

    fetchOldMessages() {
        this.socketHandler.on('fetchOldMessages', () => {
            return this.messages.get(this.matchRoomCode) || [];
        });
        return this.messages.get(this.matchRoomCode) || [];
    }

    getMatchRoomCode(){
        return this.matchRoomCode;
    }

    sendMessage(roomCode: string, message: Message): void {
        const sentData: sentData = { roomCode, message };
        //this.socketHandler.send('roomMessage', {text: message, author: this.matchRoomService.getUsername(),  date: new Date() }); //rename roomMessage
        this.socketHandler.send('roomMessage', sentData, (res: { code: string; message: Message }) => {
            this.matchRoomCode = res.code;
            this.message.author = res.message.author;
            this.message.text = res.message.text;
            this.message.date = res.message.date;
        });
    }
}

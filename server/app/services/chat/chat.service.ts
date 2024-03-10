import { PlayerRoomService } from '../player-room/player-room.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Message } from '@app/model/schema/message.schema';

export class ChatService {
    // nest syntax
    //private messageHistory: string[] = []; 

    messages: Map<string, Message[]> = new Map();

    //private messages: Map<string, string>;
    //https://www.makeuseof.com/build-real-time-chat-api-using-websockets-nestjs/

    constructor(private playerRoomService: PlayerRoomService, private matchRoomService: MatchRoomService) {
    }

    addMessage(message: Message, roomCode: string): Message{
        this.matchRoomService?.getMatchRoomByCode(roomCode)?.messages.push(message);
        const roomMessages = this.messages.get(roomCode) || [];
        roomMessages.push(message);
        this.messages.set(roomCode, roomMessages);
        return message;
    }
    
    getMessagesStringified(code: string): string{
        const messages = this.messages.get(code);
        return JSON.stringify(messages, (key, value) => {
            if (key !== 'socket') {
                return value;
            }
        });
    }

    getMessages(roomCode: string): Message[] {
        //return this.matchRoomService?.getMatchRoomByCode(roomCode)?.messages;
        return this.messages.get(roomCode) || [];
    }
}

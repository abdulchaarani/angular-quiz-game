import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Message } from '@app/model/schema/message.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    constructor(private matchRoomService: MatchRoomService) {}

    addMessage(message: Message, roomCode: string) {
        const matchRoomIndex = this.matchRoomService.getRoomIndexByCode(roomCode);
        if (matchRoomIndex === -1) {
            return;
        }
        this.matchRoomService.matchRooms[matchRoomIndex].messages.push(message);
        return message;
    }

    getMessages(roomCode: string): Message[] {
        const matchRoomIndex = this.matchRoomService.getRoomIndexByCode(roomCode);
        if (matchRoomIndex === -1) {
            return [];
        }
        return this.matchRoomService.matchRooms[matchRoomIndex].messages;
    }
}

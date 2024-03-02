import { Injectable } from '@angular/core';
import { MatchRoomService } from '../match-room/match-room.service';

@Injectable({
    providedIn: 'root',
})
export class JoinMatchService {
    constructor(private matchRoomService: MatchRoomService) {}

    // Validation must be with HTTP

    connectPlayer() {
        this.matchRoomService.connect();
    }

    joinRoom(roomCode: string) {
        this.matchRoomService.joinRoom(roomCode);
    }
}

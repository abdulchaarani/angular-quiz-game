import { Injectable } from '@angular/core';
// import { MatchRoomService } from './match-room/match-room.service';
import { MatchService } from './match/match.service';

@Injectable({
    providedIn: 'root',
})
export class VirtualHostService {
    constructor(
        // private matchRoomService: MatchRoomService,
        private matchService: MatchService,
    ) {}

    ngOnInit() {
        this.matchService.createMatch(true);
        // this.matchRoomService.joinRoom();
    }
}

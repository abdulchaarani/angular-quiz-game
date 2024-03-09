import { Component } from '@angular/core';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
    constructor(public matchRoomService: MatchRoomService) {}
}

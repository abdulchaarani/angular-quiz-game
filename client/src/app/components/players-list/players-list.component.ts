import { Component } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
    players: Player[] = this.matchRoomService.players;
    constructor(private readonly matchRoomService: MatchRoomService) {}
}

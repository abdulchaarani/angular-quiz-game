import { Component, Input } from '@angular/core';
import { MatchContext } from '@app/constants/states';
import { Player } from '@app/interfaces/player';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchContextService } from '@app/services/question-context/question-context.service';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
    @Input() players: Player[];

    context = MatchContext;
    constructor(
        readonly matchRoomService: MatchRoomService,
        readonly matchContextService: MatchContextService,
    ) {}
}

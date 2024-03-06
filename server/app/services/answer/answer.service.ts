import { Injectable } from '@nestjs/common';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { Player } from '@app/model/schema/player.schema';

@Injectable()
export class AnswerService {
    constructor(
        private matchRoomService: MatchRoomService,
        private playerService: PlayerRoomService,
    ) {}

    // eslint-disable-next-line max-params
    // permit more paramters to make method reusable
    updateChoice(choice: string, selection: boolean, username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        player.answer.selectedChoices.set(choice, selection);
        player.answer.timestamp = Date.now();
    }
}

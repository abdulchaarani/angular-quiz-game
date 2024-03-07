import { Injectable } from '@nestjs/common';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { Player } from '@app/model/schema/player.schema';
import { Answer } from '@app/model/schema/answer.schema';

@Injectable()
export class AnswerService {
    constructor(
        private matchRoomService: MatchRoomService,
        private playerService: PlayerRoomService,
    ) {}

    // permit more paramters to make method reusable
    // eslint-disable-next-line max-params
    updateChoice(choice: string, selection: boolean, username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        if (!player.answer.isSubmited) player.answer.selectedChoices.set(choice, selection);
    }

    submitAnswer(username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        player.answer.isSubmited = true;
        player.answer.timestamp = Date.now();
    }

    validatePlayerAnswer(selectedChoices: string[], username: string, roomCode: string) {
        const playerAnswer: Answer = this.playerService.getPlayerByUsername(roomCode, username).answer;
        const correctAnswer: string[] = this.matchRoomService.getMatchRoomByCode(roomCode).currentQuestionAnswer;
        const playerChoices = this.filterSelectedChoices(playerAnswer);
        return playerChoices.sort().toString() === correctAnswer.sort().toString();
    }

    private filterSelectedChoices(answer: Answer) {
        const selectedChoices: string[] = [];
        for (const [choice, selection] of answer.selectedChoices) {
            if (selection) selectedChoices.push(choice);
        }
        return selectedChoices;
    }
}

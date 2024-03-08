import { TimerEvents } from '@app/constants/timer-events';
import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import { Answer } from '@app/model/schema/answer.schema';
import { Player } from '@app/model/schema/player.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

// TODO move to constants
const BONUS_FACTOR = 0.2;
interface Feedback {
    score: number;
    correctAnswer: string[];
}
@Injectable()
export class AnswerService {
    constructor(
        private matchRoomService: MatchRoomService,
        private playerService: PlayerRoomService,
    ) {}

    @OnEvent(TimerEvents.QuestionTimerExpired)
    onQuestionTimerExpired(roomCode: string) {
        this.autoSubmitAnswers(roomCode);
        this.calculateScore(roomCode);
        this.sendFeedback(roomCode);
    }
    // permit more paramters to make method reusable
    // eslint-disable-next-line max-params
    updateChoice(choice: string, selection: boolean, username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        if (!player.answer.isSubmited) player.answer.selectedChoices.set(choice, selection);
        this.updateChoiceTally(choice, selection, roomCode);
    }

    submitAnswer(username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        player.answer.isSubmited = true;
        player.answer.timestamp = Date.now();
    }

    private getMatchRoomByCode(roomCode: string) {
        return this.matchRoomService.getMatchRoomByCode(roomCode);
    }

    private updateChoiceTally(choice: string, selection: boolean, roomCode: string) {
        const choiceTally = this.getMatchRoomByCode(roomCode).choiceTally;
        if (selection) choiceTally.incrementCount(choice);
        else choiceTally.decrementCount(choice);
        this.updateHistogram(choiceTally, roomCode);
    }

    private updateHistogram(choiceTally: ChoiceTally, roomCode: string) {
        const matchRoom = this.getMatchRoomByCode(roomCode);
        const currentTally = Array.from(choiceTally);
        matchRoom.hostSocket.send('currentTally', currentTally);
    }

    private isCorrectPlayerAnswer(player: Player, roomCode: string) {
        const correctAnswer: string[] = this.getMatchRoomByCode(roomCode).currentQuestionAnswer;
        const playerChoices = this.filterSelectedChoices(player.answer);
        return playerChoices.sort().toString() === correctAnswer.sort().toString();
    }

    private filterSelectedChoices(answer: Answer) {
        const selectedChoices: string[] = [];
        for (const [choice, selection] of answer.selectedChoices) {
            if (selection) selectedChoices.push(choice);
        }
        return selectedChoices;
    }

    private autoSubmitAnswers(roomCode: string) {
        const submitTime = Date.now();
        const players: Player[] = this.playerService.getPlayers(roomCode);
        players.forEach((player) => {
            if (!player.answer.isSubmited) {
                player.answer.isSubmited = true;
                player.answer.timestamp = submitTime;
            }
        });
    }

    private getCurrentQuestionValue(roomCode: string): number {
        const matchRoom = this.getMatchRoomByCode(roomCode);
        const currentQuestionIndex = matchRoom.currentQuestionIndex;
        return matchRoom.game.questions[currentQuestionIndex].points;
    }

    private calculateScore(roomCode: string) {
        const currentQuestionPoints = this.getCurrentQuestionValue(roomCode);
        const players: Player[] = this.playerService.getPlayers(roomCode);
        const correctPlayers: Player[] = [];
        let fastestTime;
        players.forEach((player) => {
            if (this.isCorrectPlayerAnswer(player, roomCode)) {
                player.score += currentQuestionPoints;
                correctPlayers.push(player);
                if (!fastestTime || player.answer.timestamp < fastestTime) fastestTime = player.answer.timestamp;
            }
        });

        this.computeFastestPlayerBonus(currentQuestionPoints, fastestTime, correctPlayers);
    }

    private computeFastestPlayerBonus(points: number, fastestTime: number, correctPlayers: Player[]) {
        const fastestPlayers = correctPlayers.filter((player) => player.answer.timestamp === fastestTime);
        if (fastestPlayers.length > 1) return;

        const fastestPlayer = fastestPlayers[0];
        fastestPlayer.score += points * BONUS_FACTOR;
        fastestPlayer.bonusCount++;
    }

    private sendFeedback(roomCode: string) {
        const correctAnswer: string[] = this.getMatchRoomByCode(roomCode).currentQuestionAnswer;
        const players: Player[] = this.playerService.getPlayers(roomCode);
        players.forEach((player: Player) => {
            const feedback: Feedback = { score: player.score, correctAnswer };
            player.socket.send('feedback', feedback);
        });
    }
}

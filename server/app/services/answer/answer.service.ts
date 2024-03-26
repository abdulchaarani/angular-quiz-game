import { AnswerEvents } from '@common/events/answer.events';
import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Feedback } from '@common/interfaces/feedback';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LongAnswerInfo } from '@common/interfaces/long-answer-info';
import { AnswerCorrectness } from '@common/constants/answer-correctness';
import { QuestionStrategyService } from '@app/question-strategy/question-strategy.service';
import { GradingEvents } from '@app/constants/grading-events';

@Injectable()
export class AnswerService {
    // Allow more constructor parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly playerService: PlayerRoomService,
        private readonly timeService: TimeService,
        private readonly histogramService: HistogramService,
        private readonly questionStrategyService: QuestionStrategyService,
    ) {}

    @OnEvent(ExpiredTimerEvents.QuestionTimerExpired)
    onQuestionTimerExpired(roomCode: string) {
        const players: Player[] = this.playerService.getPlayers(roomCode);
        const matchRoom = this.getRoom(roomCode);

        this.autoSubmitAnswers(roomCode);
        this.questionStrategyService.gradeAnswers(matchRoom, players);
    }

    @OnEvent(GradingEvents.GradingComplete)
    onGradingCompleteEvent(roomCode: string) {
        this.sendFeedback(roomCode);
    }

    // permit more paramters to make method reusable
    // eslint-disable-next-line max-params
    updateChoice(choice: string, selection: boolean, username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        if (!player.answer.isSubmitted) {
            player.answer.updateChoice(choice, selection);
            this.histogramService.updateHistogram(choice, selection, roomCode);
        }
    }

    calculateScore(roomCode: string, grades?: LongAnswerInfo[]) {
        const players: Player[] = this.playerService.getPlayers(roomCode);
        const matchRoom = this.getRoom(roomCode);
        this.questionStrategyService.calculateScore(matchRoom, players, grades);
    }

    submitAnswer(username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        const matchRoom = this.getRoom(roomCode);

        player.answer.isSubmitted = true;
        player.answer.timestamp = Date.now();
        matchRoom.submittedPlayers++;

        this.handleFinalAnswerSubmitted(matchRoom);
    }

    // updateScore(roomCode: string, grades: LongAnswerInfo[]) {
    //     const currentQuestionPoints = this.getCurrentQuestionValue(roomCode);
    //     grades.forEach((grade) => {
    //         const score = parseInt(grade.score, 10);
    //         const player = this.playerService.getPlayerByUsername(roomCode, grade.username);
    //         player.answerCorrectness = score;
    //         player.score += currentQuestionPoints * (score / MULTIPLICATION_FACTOR);
    //     });
    //     this.sendFeedback(roomCode);
    // }

    private getRoom(roomCode: string) {
        return this.matchRoomService.getRoom(roomCode);
    }

    private handleFinalAnswerSubmitted(matchRoom: MatchRoom) {
        if (matchRoom.submittedPlayers === matchRoom.activePlayers) {
            this.timeService.terminateTimer(matchRoom.code);
            this.onQuestionTimerExpired(matchRoom.code);
        }
    }

    private autoSubmitAnswers(roomCode: string) {
        const players: Player[] = this.playerService.getPlayers(roomCode);
        players.forEach((player) => {
            if (!player.answer.isSubmitted) {
                player.answer.isSubmitted = true;
                player.answer.timestamp = Infinity;
            }
        });
    }

    // private getCurrentQuestionValue(roomCode: string): number {
    //     const matchRoom = this.getRoom(roomCode);
    //     const currentQuestionIndex = matchRoom.currentQuestionIndex;
    //     return matchRoom.game.questions[currentQuestionIndex].points;
    // }

    // private calculateScore(roomCode: string) {
    //     const currentQuestionPoints = this.getCurrentQuestionValue(roomCode);
    //     const players: Player[] = this.playerService.getPlayers(roomCode);
    //     const correctPlayers: Player[] = [];
    //     let fastestTime: number;
    //     const correctAnswer: string[] = this.getRoom(roomCode).currentQuestionAnswer;
    //     players.forEach((player) => {
    //         if (player.answer.isCorrectAnswer(correctAnswer)) {
    //             player.answerCorrectness = AnswerCorrectness.GOOD;
    //             player.score += currentQuestionPoints;
    //             correctPlayers.push(player);
    //             if ((!fastestTime || player.answer.timestamp < fastestTime) && player.answer.timestamp !== Infinity)
    //                 fastestTime = player.answer.timestamp;
    //         }
    //     });

    //     if ((fastestTime && !this.getRoom(roomCode).isTestRoom) || this.getRoom(roomCode).isTestRoom)
    //         this.computeFastestPlayerBonus(currentQuestionPoints, fastestTime, correctPlayers);
    // }

    // private computeFastestPlayerBonus(points: number, fastestTime: number, correctPlayers: Player[]) {
    //     const fastestPlayers = correctPlayers.filter((player) => player.answer.timestamp === fastestTime);
    //     if (fastestPlayers.length !== 1) return;
    //     const fastestPlayer = fastestPlayers[0];
    //     const bonus = points * BONUS_FACTOR;
    //     fastestPlayer.score += bonus;
    //     fastestPlayer.bonusCount++;
    //     fastestPlayer.socket.emit(AnswerEvents.Bonus, bonus);
    // }

    private sendFeedback(roomCode: string, correctAnswer?: string[]) {
        const players: Player[] = this.playerService.getPlayers(roomCode);
        players.forEach((player: Player) => {
            const feedback: Feedback = { score: player.score, answerCorrectness: player.answerCorrectness, correctAnswer };
            player.socket.emit(AnswerEvents.Feedback, feedback);
            player.answerCorrectness = AnswerCorrectness.WRONG;
        });

        const matchRoom = this.getRoom(roomCode);
        matchRoom.hostSocket.emit(AnswerEvents.Feedback);
        if (matchRoom.gameLength === 1 + matchRoom.currentQuestionIndex) matchRoom.hostSocket.emit(AnswerEvents.EndGame);
        this.finaliseRound(roomCode);
    }

    private finaliseRound(roomCode: string) {
        this.histogramService.saveHistogram(roomCode);
        this.getRoom(roomCode).submittedPlayers = 0;
        this.matchRoomService.incrementCurrentQuestionIndex(roomCode);
    }

    // private gradeAnswers(roomCode: string) {
    //     const players: Player[] = this.playerService.getPlayers(roomCode);

    //     if (this.getRoom(roomCode).isTestRoom) {
    //         const testAnswer: LongAnswerInfo[] = [{ username: players[0].username, answer: '', score: '100' }];
    //         this.updateScore(roomCode, testAnswer);
    //         return;
    //     }

    //     const playerAnswers = players.map((player: Player) => {
    //         const answer: string = (player.answer as LongAnswer).answer;
    //         const username: string = player.username;
    //         const longAnswerInfo: LongAnswerInfo = { username, answer };
    //         return longAnswerInfo;
    //     });

    //     const matchRoom = this.getRoom(roomCode);
    //     matchRoom.hostSocket.emit(AnswerEvents.GradeAnswers, playerAnswers);
    // }

    // private getQuestionType(roomCode: string) {
    //     return this.matchRoomService.getCurrentQuestion(roomCode).type;
    // }
}

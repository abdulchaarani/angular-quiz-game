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
import { QuestionStrategyContext } from '@app/services/question-strategy-context/question-strategy.service';
import { GradingEvents } from '@app/constants/grading-events';
import { TimerDurationEvents } from '@app/constants/timer-events';
import { HISTOGRAM_UPDATE_TIME_SECONDS, HISTOGRAM_UPDATE_TIME_MS } from '@common/constants/match-constants';
import { LongAnswerHistogram } from '@common/interfaces/histogram';
@Injectable()
export class AnswerService {
    // Allow more constructor parameters to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly playerService: PlayerRoomService,
        private readonly timeService: TimeService,
        private readonly histogramService: HistogramService,
        private readonly questionStrategyService: QuestionStrategyContext,
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
        this.finaliseRound(roomCode);
    }

    @OnEvent(TimerDurationEvents.Timer)
    onTimerTick(roomCode: string, currentTimer: number) {
        if (this.questionStrategyService.getQuestionStrategy() !== 'QRL') return;
        if (currentTimer % HISTOGRAM_UPDATE_TIME_SECONDS === 0) {
            // do smth
            const players: Player[] = this.playerService.getPlayers(roomCode);
            const time = Date.now() - HISTOGRAM_UPDATE_TIME_MS;
            const longAnswerHistogram = players.reduce((currentHistogram: LongAnswerHistogram, player) => {
                currentHistogram.playerCount++;
                if (player.answer.timestamp >= time) currentHistogram.activePlayers++;
                return currentHistogram;
            }, {} as LongAnswerHistogram);
            longAnswerHistogram.inactivePlayers = longAnswerHistogram.playerCount - longAnswerHistogram.activePlayers;
        }
    }

    // permit more parameters to make method reusable
    // eslint-disable-next-line max-params
    updateChoice(choice: string, selection: boolean, username: string, roomCode: string) {
        const player: Player = this.playerService.getPlayerByUsername(roomCode, username);
        if (!player.answer.isSubmitted) {
            player.answer.updateChoice(choice, selection);
            player.answer.timestamp = Date.now();
            // TODO: move prolly
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
        matchRoom.submittedPlayers++;

        this.handleFinalAnswerSubmitted(matchRoom);
    }

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
    }

    private finaliseRound(roomCode: string) {
        this.histogramService.saveHistogram(roomCode);
        this.matchRoomService.resetPlayerSubmissionCount(roomCode);
        this.matchRoomService.incrementCurrentQuestionIndex(roomCode);
    }
}

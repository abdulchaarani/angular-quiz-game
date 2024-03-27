import { TimerDurationEvents } from '@app/constants/timer-events';
import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';

import { Histogram, MultipleChoiceHistogram } from '@common/interfaces/histogram';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuestionStrategyContext } from '@app/services/question-strategy-context/question-strategy.service';
import { HISTOGRAM_UPDATE_TIME_SECONDS } from '@common/constants/match-constants';
import { Player } from '@app/model/schema/player.schema';
@Injectable()
export class HistogramService {
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly playerService: PlayerRoomService,
        private readonly questionStrategyContext: QuestionStrategyContext,
    ) {}

    @OnEvent(TimerDurationEvents.Timer)
    onTimerTick(roomCode: string, currentTimer: number) {
        if (this.questionStrategyContext.getQuestionStrategy() !== 'QRL') return;
        if (currentTimer % HISTOGRAM_UPDATE_TIME_SECONDS === 0) {
            const players: Player[] = this.playerService.getPlayers(roomCode);
            this.questionStrategyContext.updateHistogram(players);
        }
    }

    updateHistogram(choice: string, selection: boolean, roomCode: string) {
        const choiceTracker = this.matchRoomService.getRoom(roomCode).currentChoiceTracker;
        if (selection) choiceTracker.incrementCount(choice);
        else choiceTracker.decrementCount(choice);
        this.sendHistogram(roomCode);
    }

    saveHistogram(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        const choiceTracker: ChoiceTracker = matchRoom.currentChoiceTracker;
        const histogram: Histogram = this.buildHistogram(choiceTracker);
        matchRoom.matchHistograms.push(histogram);
    }

    sendHistogramHistory(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        const histograms: Histogram[] = matchRoom.matchHistograms;

        matchRoom.hostSocket.emit('histogramHistory', histograms);
        return histograms;
    }

    resetChoiceTracker(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        const currentQuestion = this.matchRoomService.getCurrentQuestion(matchRoomCode);
        matchRoom.currentChoiceTracker.resetChoiceTracker(currentQuestion.text, currentQuestion.choices);
    }

    sendHistogram(roomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(roomCode);
        const choiceTracker = matchRoom.currentChoiceTracker;
        const histogram: Histogram = this.buildHistogram(choiceTracker);
        matchRoom.hostSocket.emit('currentHistogram', histogram);
    }

    private buildHistogram(choiceTracker: ChoiceTracker): MultipleChoiceHistogram {
        return { question: choiceTracker.question, choiceTallies: Object.values(choiceTracker.choices) };
    }
}

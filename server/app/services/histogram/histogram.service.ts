import { TimerDurationEvents } from '@app/constants/timer-events';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { QuestionStrategyContext } from '@app/services/question-strategy-context/question-strategy.service';
import { HISTOGRAM_UPDATE_TIME_SECONDS } from '@common/constants/match-constants';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { TimerInfo } from '@common/interfaces/timer-info';
@Injectable()
export class HistogramService {
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly questionStrategyContext: QuestionStrategyContext,
    ) {}

    @OnEvent(TimerDurationEvents.Timer)
    onTimerTick(roomCode: string, currentTimer: TimerInfo) {
        if (this.questionStrategyContext.getQuestionStrategy() !== 'QRL') return;
        if (currentTimer.currentTime % HISTOGRAM_UPDATE_TIME_SECONDS === 0) {
            const matchRoom = this.matchRoomService.getRoom(roomCode);
            this.buildHistogram(matchRoom);
        }
    }

    buildHistogram(matchRoom: MatchRoom, choice?: string, selection?: boolean) {
        const histogram: Histogram = this.questionStrategyContext.buildHistogram(matchRoom, choice, selection);
        this.saveHistogram(histogram, matchRoom);
        this.sendHistogram(histogram, matchRoom);
    }

    saveHistogram(histogram: Histogram, matchRoom: MatchRoom) {
        matchRoom.matchHistograms[matchRoom.currentQuestionIndex] = histogram;
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
        matchRoom.choiceTracker.resetChoiceTracker(currentQuestion.text, currentQuestion.choices);
    }

    sendHistogram(histogram: Histogram, matchRoom: MatchRoom) {
        matchRoom.hostSocket.emit('currentHistogram', histogram);
    }

    sendEmptyHistogram(roomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(roomCode);
        const histogram: Histogram = this.questionStrategyContext.buildHistogram(matchRoom);
        matchRoom.hostSocket.emit('currentHistogram', histogram);
    }
}

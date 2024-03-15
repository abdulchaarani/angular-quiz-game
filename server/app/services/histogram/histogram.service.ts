import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HistogramService {
    constructor(private matchRoomService: MatchRoomService) {}

    updateHistogram(choice: string, selection: boolean, roomCode: string) {
        const choiceTracker = this.matchRoomService.getMatchRoomByCode(roomCode).currentChoiceTracker;
        if (selection) choiceTracker.incrementCount(choice);
        else choiceTracker.decrementCount(choice);
        this.sendHistogram(roomCode);
    }

    saveHistogram(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        const choiceTracker: ChoiceTracker = matchRoom.currentChoiceTracker;
        const histogram: Histogram = this.buildHistogram(choiceTracker);
        matchRoom.matchHistograms.push(histogram);
        this.sendHistogramHistory(matchRoomCode);
    }

    sendHistogramHistory(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        const histograms: Histogram[] = matchRoom.matchHistograms;
        matchRoom.hostSocket.emit('histogramHistory', histograms);
    }

    resetChoiceTracker(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        const currentQuestion = matchRoom.game.questions[matchRoom.currentQuestionIndex];
        matchRoom.currentChoiceTracker.resetChoiceTracker(currentQuestion.text, currentQuestion.choices);
    }

    // setUpHistogram(matchRoomCode: string) {
    //     const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
    //     const currentQuestion = matchRoom.game.questions[matchRoom.currentQuestionIndex];
    //     matchRoom.currentChoiceTracker = new ChoiceTracker();
    //     const histogram: Histogram = this.buildHistogram(matchRoom.currentChoiceTracker);
    //     matchRoom.hostSocket.emit('setUpHistogram', histogram);
    // }

    sendHistogram(roomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(roomCode);
        const choiceTracker = matchRoom.currentChoiceTracker;
        const histogram: Histogram = this.buildHistogram(choiceTracker);
        matchRoom.hostSocket.emit('currentHistogram', histogram);
    }

    private buildHistogram(choiceTracker: ChoiceTracker): Histogram {
        return { question: choiceTracker.question, choiceTallies: Object.values(choiceTracker.choices) };
    }
}

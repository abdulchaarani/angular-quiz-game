import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HistogramService {
    constructor(private readonly matchRoomService: MatchRoomService) {}

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

    private buildHistogram(choiceTracker: ChoiceTracker): Histogram {
        return { question: choiceTracker.question, choiceTallies: Object.values(choiceTracker.choices) };
    }
}

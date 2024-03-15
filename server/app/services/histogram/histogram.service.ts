import { Injectable } from '@nestjs/common';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChoiceHistogram } from '@app/model/choice-histogram/choice-histogram';
import { Choice } from '@app/model/database/choice';

@Injectable()
export class HistogramService {
    constructor(private matchRoomService: MatchRoomService) {}

    updateHistogram(choice: string, selection: boolean, roomCode: string) {
        const choiceHistogram = this.matchRoomService.getMatchRoomByCode(roomCode).currentChoiceHistogram;
        if (selection) choiceHistogram.incrementCount(choice);
        else choiceHistogram.decrementCount(choice);
        this.sendHistogram(choiceHistogram, roomCode);
    }

    saveHistogram(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        matchRoom.matchHistograms.push(matchRoom.currentChoiceHistogram);
    }

    sendHistogramHistory(matchRoomCode) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        const histograms = matchRoom.matchHistograms.map((choiceHistogram) => choiceHistogram.choices);
        matchRoom.hostSocket.send('histogramHistory', histograms);
    }

    resetChoiceHistogram(matchRoomCode) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(matchRoomCode);
        const possibleChoices: Choice[] = matchRoom.game.questions[matchRoom.currentQuestionIndex].choices;
        matchRoom.currentChoiceHistogram.resetChoiceHistogram(possibleChoices);
    }

    private sendHistogram(choiceHistogram: ChoiceHistogram, roomCode: string) {
        const matchRoom = this.matchRoomService.getMatchRoomByCode(roomCode);
        matchRoom.hostSocket.send('currentHistogram', choiceHistogram.choices);
    }
}

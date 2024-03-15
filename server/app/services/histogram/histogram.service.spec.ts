import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';
import { Choice } from '@app/model/database/choice';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('HistogramService', () => {
    let histogramService: HistogramService;
    let matchRoomService: SinonStubbedInstance<MatchRoomService>;
    let mockHostSocket;

    const mockMatchRoom = MOCK_MATCH_ROOM;

    beforeEach(async () => {
        matchRoomService = createStubInstance(MatchRoomService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [HistogramService, { provide: MatchRoomService, useValue: matchRoomService }],
        }).compile();

        mockHostSocket = {
            send: jest.fn(),
        };
        mockMatchRoom.hostSocket = mockHostSocket;
        matchRoomService.getMatchRoomByCode.returns(mockMatchRoom);
        histogramService = module.get<HistogramService>(HistogramService);
    });

    it('should be defined', () => {
        expect(histogramService).toBeDefined();
    });

    it('should update histogram and increment if true', () => {
        const choice = 'choice';
        const selection = true;
        const roomCode = '0001';
        matchRoomService.getMatchRoomByCode.returns(mockMatchRoom);
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        jest.spyOn(choiceTracker, 'incrementCount');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, roomCode);
        expect(choiceTracker.incrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceTracker.incrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceTracker.choices);
    });

    it('should update histogram and decrement if false', () => {
        const choice = 'choice';
        const selection = false;
        const roomCode = '0001';
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        jest.spyOn(choiceTracker, 'decrementCount');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, roomCode);
        expect(choiceTracker.decrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceTracker.decrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceTracker.choices);
    });

    it('should save histogram', () => {
        const matchRoomCode = '0001';
        jest.spyOn(mockMatchRoom.matchHistograms, 'push');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.saveHistogram(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(mockMatchRoom.matchHistograms.push).toHaveBeenCalledWith(mockMatchRoom.currentChoiceTracker);
    });

    // it('should send histogram history', () => {
    //     const matchRoomCode = '0001';
    //     mockMatchRoom.hostSocket = mockHostSocket;
    //     const histograms = mockMatchRoom.matchHistograms.map((choiceTracker) => choiceTracker.choices);
    //     jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
    //     histogramService.sendHistogramHistory(matchRoomCode);
    //     expect(mockMatchRoom.hostSocket.send).toHaveBeenCalledWith('histogramHistory', histograms);
    //     expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
    //     expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    // });

    it('should reset choice histogram', () => {
        const matchRoomCode = '0001';
        const possibleChoices: Choice[] = mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex].choices;
        jest.spyOn(mockMatchRoom.currentChoiceTracker, 'resetChoiceTracker');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService['resetChoiceTracker'](matchRoomCode);
        expect(mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex].choices).toEqual(possibleChoices);
        expect(mockMatchRoom.currentChoiceTracker.resetChoiceTracker).toHaveBeenCalledWith(possibleChoices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    });

    it('should send histogram', () => {
        const roomCode = '0001';
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        jest.spyOn(mockMatchRoom.hostSocket, 'send');
        histogramService['sendHistogram'](roomCode);
        expect(mockMatchRoom.hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceTracker.choices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    });
});

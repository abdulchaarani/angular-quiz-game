import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';
import { Choice } from '@app/model/database/choice';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { HistogramService } from '@app/services/histogram/histogram.service';

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
        const choiceHistogram = mockMatchRoom.currentChoiceHistogram;
        jest.spyOn(choiceHistogram, 'incrementCount');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, roomCode);
        expect(choiceHistogram.incrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceHistogram.incrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceHistogram.choices);
    });

    it('should update histogram and decrement if false', () => {
        const choice = 'choice';
        const selection = false;
        const roomCode = '0001';
        const choiceHistogram = mockMatchRoom.currentChoiceHistogram;
        jest.spyOn(choiceHistogram, 'decrementCount');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, roomCode);
        expect(choiceHistogram.decrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceHistogram.decrementCount).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceHistogram.choices);
    });

    it('should save histogram', () => {
        const matchRoomCode = '0001';
        jest.spyOn(mockMatchRoom.matchHistograms, 'push');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.saveHistogram(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(2);
        expect(mockMatchRoom.matchHistograms.push).toHaveBeenCalledWith(mockMatchRoom.currentChoiceHistogram);
    });

    it('should send histogram history', () => {
        const matchRoomCode = '0001';
        mockMatchRoom.hostSocket = mockHostSocket;
        const histograms = mockMatchRoom.matchHistograms.map((choiceHistogram) => choiceHistogram.choices);
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.sendHistogramHistory(matchRoomCode);
        expect(mockMatchRoom.hostSocket.send).toHaveBeenCalledWith('histogramHistory', histograms);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    });

    it('should reset choice histogram', () => {
        const matchRoomCode = '0001';
        const possibleChoices: Choice[] = mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex].choices;
        jest.spyOn(mockMatchRoom.currentChoiceHistogram, 'resetChoiceHistogram');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService['resetChoiceHistogram'](matchRoomCode);
        expect(mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex].choices).toEqual(possibleChoices);
        expect(mockMatchRoom.currentChoiceHistogram.resetChoiceHistogram).toHaveBeenCalledWith(possibleChoices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    });

    it('should send histogram', () => {
        const roomCode = '0001';
        const choiceHistogram = mockMatchRoom.currentChoiceHistogram;
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        jest.spyOn(mockMatchRoom.hostSocket, 'send');
        histogramService['sendHistogram'](choiceHistogram, roomCode);
        expect(mockMatchRoom.hostSocket.send).toHaveBeenCalledWith('currentHistogram', choiceHistogram.choices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(roomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledTimes(1);
    });
});

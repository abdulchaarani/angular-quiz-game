import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
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
            emit: jest.fn(),
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
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceTracker.incrementCount).toHaveBeenCalledWith(choice);
        const histogram: Histogram = histogramService['buildHistogram'](choiceTracker);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.emit).toHaveBeenCalledWith('currentHistogram', histogram);
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
        expect(matchRoomService.getMatchRoomByCode(roomCode).currentChoiceTracker.decrementCount).toHaveBeenCalledWith(choice);
        const histogram: Histogram = histogramService['buildHistogram'](choiceTracker);
        expect(matchRoomService.getMatchRoomByCode(roomCode).hostSocket.emit).toHaveBeenCalledWith('currentHistogram', histogram);
    });

    it('should save histogram', () => {
        const matchRoomCode = mockMatchRoom.code;
        jest.spyOn(mockMatchRoom.matchHistograms, 'push');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.saveHistogram(matchRoomCode);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
        const histogram: Histogram = histogramService['buildHistogram'](mockMatchRoom.currentChoiceTracker);
        expect(mockMatchRoom.matchHistograms.push).toHaveBeenCalledWith(histogram);
    });

    it('should send histogram history', () => {
        const matchRoomCode = mockMatchRoom.code;
        const histograms: Histogram[] = mockMatchRoom.matchHistograms;
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.sendHistogramHistory(matchRoomCode);
        expect(mockMatchRoom.hostSocket.emit).toHaveBeenCalledWith('histogramHistory', histograms);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
    });

    it('should reset choice histogram', () => {
        const matchRoomCode = mockMatchRoom.code;
        jest.spyOn(mockMatchRoom.currentChoiceTracker, 'resetChoiceTracker');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        const currentQuestion = mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex];
        histogramService['resetChoiceTracker'](matchRoomCode);
        expect(mockMatchRoom.currentChoiceTracker.resetChoiceTracker).toHaveBeenCalledWith(currentQuestion.text, currentQuestion.choices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(matchRoomCode);
    });

    it('should send histogram', () => {
        const roomCode = mockMatchRoom.code;
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        jest.spyOn(mockMatchRoom.hostSocket, 'emit');
        histogramService['sendHistogram'](roomCode);
        const histogram: Histogram = histogramService['buildHistogram'](choiceTracker);
        expect(mockMatchRoom.hostSocket.emit).toHaveBeenCalledWith('currentHistogram', histogram);
    });

    it('should build histogram', () => {
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        const histogram: Histogram = histogramService['buildHistogram'](choiceTracker);
        expect(histogram.question).toEqual(choiceTracker.question);
        expect(histogram.choiceTallies).toEqual(Object.values(choiceTracker.choices));
    });
});

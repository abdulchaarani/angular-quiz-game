import { MOCK_ROOM_CODE } from '@app/constants/chat-mocks';
import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';
import { Choice } from '@app/model/database/choice';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('HistogramService', () => {
    let histogramService: HistogramService;
    let matchRoomService: SinonStubbedInstance<MatchRoomService>;
    let emitMock;
    let mockSocket;

    const mockMatchRoom = MOCK_MATCH_ROOM;

    beforeEach(async () => {
        matchRoomService = createStubInstance(MatchRoomService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [HistogramService, { provide: MatchRoomService, useValue: matchRoomService }],
        }).compile();

        emitMock = jest.fn();

        mockSocket = {
            to: jest.fn().mockReturnValueOnce({ emit: emitMock }),
            send: jest.fn().mockReturnValueOnce({ emit: emitMock }),
            emit: emitMock,
        };

        matchRoomService.getMatchRoomByCode.returns(mockMatchRoom);
        histogramService = module.get<HistogramService>(HistogramService);
    });

    it('should be defined', () => {
        expect(histogramService).toBeDefined();
    });

    it('should update histogram and increment if true', () => {
        const choice = 'choice';
        const selection = true;
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        const sendHistogramSpy = jest.spyOn(histogramService, 'sendHistogram').mockReturnThis();
        const incrementCountSpy = jest.spyOn(choiceTracker, 'incrementCount');

        mockMatchRoom.hostSocket = mockSocket;
        matchRoomService.getMatchRoomByCode.returns(mockMatchRoom);

        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, MOCK_ROOM_CODE);
        expect(incrementCountSpy).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(matchRoomService.getMatchRoomByCode(MOCK_ROOM_CODE).currentChoiceTracker.incrementCount).toHaveBeenCalledWith(choice);
        expect(sendHistogramSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('should update histogram and decrement if false', () => {
        const choice = 'choice';
        const selection = false;
        const sendHistogramSpy = jest.spyOn(histogramService, 'sendHistogram').mockReturnThis();
        const choiceTracker = mockMatchRoom.currentChoiceTracker;
        const decrementSpy = jest.spyOn(choiceTracker, 'decrementCount');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService.updateHistogram(choice, selection, MOCK_ROOM_CODE);
        expect(decrementSpy).toHaveBeenCalledWith(choice);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(matchRoomService.getMatchRoomByCode(MOCK_ROOM_CODE).currentChoiceTracker.decrementCount).toHaveBeenCalledWith(choice);
        expect(sendHistogramSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('should save histogram', () => {
        const pushSpy = jest.spyOn(mockMatchRoom.matchHistograms, 'push');
        const histogram = histogramService['buildHistogram'](mockMatchRoom.currentChoiceTracker);
        histogramService.saveHistogram(MOCK_ROOM_CODE);
        expect(pushSpy).toHaveBeenCalledWith(histogram);
    });

    it('should send histogram history', () => {
        mockMatchRoom.hostSocket = mockSocket;
        const histograms = (mockMatchRoom.matchHistograms = [] as Histogram[]);
        histogramService.sendHistogramHistory(MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith('histogramHistory', histograms);
    });

    it('should reset choice histogram', () => {
        const possibleChoices: Choice[] = mockMatchRoom.game.questions[0].choices;
        jest.spyOn(mockMatchRoom.currentChoiceTracker, 'resetChoiceTracker');
        jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(mockMatchRoom);
        histogramService['resetChoiceTracker'](MOCK_ROOM_CODE);
        expect(mockMatchRoom.game.questions[mockMatchRoom.currentQuestionIndex].choices).toEqual(possibleChoices);
        expect(mockMatchRoom.currentChoiceTracker.resetChoiceTracker).toHaveBeenCalledWith(mockMatchRoom.game.questions[0].text, possibleChoices);
        expect(matchRoomService.getMatchRoomByCode).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('should send histogram', () => {
        mockMatchRoom.hostSocket = mockSocket;
        histogramService['sendHistogram'](MOCK_ROOM_CODE);
        const histogram = histogramService['buildHistogram'](mockMatchRoom.currentChoiceTracker);
        expect(emitMock).toHaveBeenCalledWith('currentHistogram', histogram);
    });
});

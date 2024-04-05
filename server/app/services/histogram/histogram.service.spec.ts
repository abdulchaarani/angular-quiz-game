/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_ROOM_CODE } from '@app/constants/chat-mocks';
import { MOCK_MATCH_ROOM } from '@app/constants/match-mocks';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Histogram } from '@common/interfaces/histogram';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuestionStrategyContext } from '@app/services/question-strategy-context/question-strategy-context.service';
import { TimerDurationEvents } from '@app/constants/timer-events';
import { TimerInfo } from '@common/interfaces/timer-info';
import { MultipleChoiceStrategy } from '@app/question-strategies/multiple-choice-strategy/multiple-choice-strategy';
import { LongAnswerStrategy } from '@app/question-strategies/long-answer-strategy/long-answer-strategy';
import { HistogramEvents } from '@common/events/histogram.events';

describe('HistogramService', () => {
    let histogramService: HistogramService;
    let matchRoomService: SinonStubbedInstance<MatchRoomService>;
    let eventEmitter: EventEmitter2;
    let questionStrategyContext: QuestionStrategyContext;
    let emitMock;
    let mockSocket;
    let mockMatchRoom;
    const mockHistogram = {} as Histogram;

    beforeEach(async () => {
        matchRoomService = createStubInstance(MatchRoomService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistogramService,
                { provide: MatchRoomService, useValue: matchRoomService },
                EventEmitter2,
                QuestionStrategyContext,
                MultipleChoiceStrategy,
                LongAnswerStrategy,
            ],
        }).compile();

        histogramService = module.get<HistogramService>(HistogramService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        questionStrategyContext = module.get<QuestionStrategyContext>(QuestionStrategyContext);

        emitMock = jest.fn();

        mockSocket = {
            to: jest.fn().mockReturnValueOnce({ emit: emitMock }),
            send: jest.fn().mockReturnValueOnce({ emit: emitMock }),
            emit: emitMock,
        };

        mockMatchRoom = { ...MOCK_MATCH_ROOM };
        mockMatchRoom.currentQuestion.type = 'QRL';
        mockMatchRoom.hostSocket = mockSocket;

        matchRoomService.getRoom.returns(mockMatchRoom);

        questionStrategyContext.setQuestionStrategy(mockMatchRoom);
    });

    it('should be defined', () => {
        expect(histogramService).toBeDefined();
    });

    it('onTimerTick() should call buildHistogram only if current question is of type long answer and current time is a multiple of 5', () => {
        const buildHistogramSpy = jest.spyOn<any, any>(histogramService, 'buildHistogram').mockImplementation();

        eventEmitter.addListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
        expect(eventEmitter.hasListeners(TimerDurationEvents.Timer)).toBe(true);

        const timerInfo: TimerInfo = { currentTime: 30, duration: 60 };
        histogramService.onTimerTick(MOCK_ROOM_CODE, timerInfo);
        expect(buildHistogramSpy).toHaveBeenCalledWith(mockMatchRoom);

        eventEmitter.removeListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
    });

    it('onTimerTick() should not call buildHistogram if current time is not a multiple of 5', () => {
        const buildHistogramSpy = jest.spyOn<any, any>(histogramService, 'buildHistogram').mockImplementation();

        eventEmitter.addListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
        expect(eventEmitter.hasListeners(TimerDurationEvents.Timer)).toBe(true);

        const timerInfo: TimerInfo = { currentTime: 17, duration: 60 };
        histogramService.onTimerTick(MOCK_ROOM_CODE, timerInfo);
        expect(buildHistogramSpy).not.toHaveBeenCalledWith(mockMatchRoom);

        eventEmitter.removeListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
    });

    it('onTimerTick() should not call buildHistogram if current question is not of type long answer  ', () => {
        const buildHistogramSpy = jest.spyOn<any, any>(histogramService, 'buildHistogram').mockImplementation();

        eventEmitter.addListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
        expect(eventEmitter.hasListeners(TimerDurationEvents.Timer)).toBe(true);

        mockMatchRoom.currentQuestion.type = 'QCM';
        questionStrategyContext.setQuestionStrategy(mockMatchRoom);
        const timerInfo: TimerInfo = { currentTime: 30, duration: 60 };
        histogramService.onTimerTick(MOCK_ROOM_CODE, timerInfo);
        expect(buildHistogramSpy).not.toHaveBeenCalledWith(mockMatchRoom);

        eventEmitter.removeListener(TimerDurationEvents.Timer, histogramService.onTimerTick);
    });

    it('buildHistogram() should call correct helper functions', () => {
        const choice = 'choice1';
        const selection = true;

        const buildHistogramSpy = jest.spyOn<any, any>(questionStrategyContext, 'buildHistogram').mockReturnValue(mockHistogram);
        const saveHistogramSpy = jest.spyOn<any, any>(histogramService, 'saveHistogram').mockImplementation();
        const sendHistogramSpy = jest.spyOn<any, any>(histogramService, 'sendHistogram').mockImplementation();

        histogramService.buildHistogram(mockMatchRoom, choice, selection);

        expect(buildHistogramSpy).toHaveBeenCalledWith(mockMatchRoom, choice, selection);
        expect(saveHistogramSpy).toHaveBeenCalledWith(mockHistogram, mockMatchRoom);
        expect(sendHistogramSpy).toHaveBeenCalledWith(mockHistogram, mockMatchRoom);
    });

    it('saveHistogram() should save histogram', () => {
        mockMatchRoom.matchHistograms = [];
        histogramService.saveHistogram(mockHistogram, mockMatchRoom);
        expect(mockMatchRoom.matchHistograms[mockMatchRoom.currentQuestionIndex]).toBe(mockHistogram);
    });

    it('should send histogram history', () => {
        mockMatchRoom.hostSocket = mockSocket;
        const histograms = (mockMatchRoom.matchHistograms = [] as Histogram[]);
        histogramService.sendHistogramHistory(MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith(HistogramEvents.HistogramHistory, histograms);
    });

    it('should reset choice histogram', () => {
        const currentQuestion = mockMatchRoom.currentQuestion;
        jest.spyOn(matchRoomService, 'getCurrentQuestion').mockReturnValue(currentQuestion);
        const resetTrackerSpy = jest.spyOn(mockMatchRoom.choiceTracker, 'resetChoiceTracker').mockImplementation();

        histogramService['resetChoiceTracker'](MOCK_ROOM_CODE);

        expect(resetTrackerSpy).toHaveBeenCalledWith(currentQuestion.text, currentQuestion.choices);
    });

    it('sendHistogram() should emit current histogram', () => {
        histogramService.sendHistogram(mockHistogram, mockMatchRoom);
        expect(mockSocket.emit).toHaveBeenCalledWith(HistogramEvents.CurrentHistogram, mockHistogram);
    });

    it('sendEmptyHistogram() should send an histogram history', () => {
        jest.spyOn<any, any>(questionStrategyContext, 'buildHistogram').mockReturnValue(mockHistogram);
        histogramService.sendEmptyHistogram(MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith(HistogramEvents.CurrentHistogram, mockHistogram);
    });
});

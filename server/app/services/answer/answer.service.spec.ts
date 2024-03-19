/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { TimerEvents } from '@app/constants/timer-events';
import { Feedback } from '@app/model/schema/answer.schema';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { BONUS_FACTOR } from '@common/constants/match-constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';

describe('AnswerService', () => {
    let service: AnswerService;
    let matchRoomServiceSpy;
    let mockHostSocket;
    let mockPlayer1Socket;
    let mockPlayer2Socket;
    let playerService;
    let matchRoomService;
    let timeService;
    let histogramService;
    let currentDate: number;
    let oldDate: number;
    let eventEmitter: EventEmitter2;
    const randomDate = 100000;

    const matchRoom = { ...MOCK_MATCH_ROOM };
    matchRoom.code = MOCK_ROOM_CODE;

    const player1 = { ...MOCK_PLAYER };
    const selectedChoices1 = new Map<string, boolean>();
    selectedChoices1.set('choice1', true);
    selectedChoices1.set('choice2', false);
    player1.username = 'player1';
    player1.answer = { selectedChoices: selectedChoices1, isSubmitted: true, timestamp: randomDate };
    matchRoom.players[0] = player1;

    const player2 = { ...MOCK_PLAYER };
    const selectedChoices2 = new Map<string, boolean>();
    selectedChoices2.set('choice1', false);
    selectedChoices2.set('choice2', true);
    player2.username = 'player2';
    player2.answer = { selectedChoices: selectedChoices2, isSubmitted: false };
    matchRoom.players[1] = player2;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AnswerService, MatchRoomService, TimeService, PlayerRoomService, EventEmitter2, HistogramService],
        }).compile();
        histogramService = module.get<HistogramService>(HistogramService);
        service = module.get<AnswerService>(AnswerService);
        matchRoomService = module.get<MatchRoomService>(MatchRoomService);
        playerService = module.get<PlayerRoomService>(PlayerRoomService);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        timeService = module.get<EventEmitter2>(TimeService);
        matchRoomServiceSpy = jest.spyOn(matchRoomService, 'getRoom').mockReturnValue(matchRoom);

        mockHostSocket = {
            send: jest.fn(),
            emit: jest.fn(),
        };
        mockPlayer1Socket = {
            emit: jest.fn(),
        };
        mockPlayer2Socket = {
            emit: jest.fn(),
        };
        matchRoom.hostSocket = mockHostSocket;

        player1.socket = mockPlayer1Socket;
        player2.socket = mockPlayer2Socket;

        service['matchRoomService'].matchRooms = [matchRoom];

        currentDate = randomDate;
        oldDate = currentDate;
        Date.now = jest.fn(() => currentDate);
    });

    afterEach(() => {
        player1.score = 0;
        player1.bonusCount = 0;
        player1.answer.timestamp = randomDate;
        player2.score = 0;
        player2.bonusCount = 0;
        player2.answer.timestamp = undefined;
        player2.answer = { selectedChoices: selectedChoices2, isSubmitted: false };
        matchRoom.submittedPlayers = 0;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getRoom() should delegate call to match room service', () => {
        service['getRoom'](MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('isCorrectPlayerAnswer() should return true if player has right answer', () => {
        matchRoom.currentQuestionAnswer = ['choice1'];
        const isCorrect = service['isCorrectPlayerAnswer'](matchRoom.players[0], MOCK_ROOM_CODE);
        expect(isCorrect).toEqual(true);
    });

    it('isCorrectPlayerAnswer() should return false if player has wrong answer', () => {
        jest.spyOn<any, any>(service, 'getRoom').mockReturnValue(matchRoom);
        matchRoom.currentQuestionAnswer = ['choice2'];
        const isCorrect = service['isCorrectPlayerAnswer'](matchRoom.players[0], MOCK_ROOM_CODE);
        expect(isCorrect).toEqual(false);
    });

    it("filterSelectedChoices() should convert the player's answer to an array of choices", () => {
        const choicesArray = service['filterSelectedChoices'](matchRoom.players[0].answer);
        expect(choicesArray).toContain('choice1');
        expect(choicesArray).not.toContain('choice2');
    });

    it("autoSubmitAnswers() should submit every player's answer if not already submitted", () => {
        expect(matchRoom.players[1].answer.isSubmitted).toBe(false);
        expect(matchRoom.players[0].answer.timestamp).toBe(currentDate);
        service['autoSubmitAnswers'](MOCK_ROOM_CODE);
        expect(matchRoom.players[1].answer.isSubmitted).toBe(true);
        expect(matchRoom.players[0].answer.timestamp).toBe(oldDate);
        expect(matchRoom.players[1].answer.timestamp).toBe(Infinity);
    });

    it("getCurrentQuestionValue() should return the current question's points weight", () => {
        const score = service['getCurrentQuestionValue'](MOCK_ROOM_CODE);
        expect(score).toEqual(30);
    });

    it("calculateScore() should add to the player's score only if they had the correct answer", () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue(matchRoom.players);
        const bonusSpy = jest.spyOn<any, any>(service, 'computeFastestPlayerBonus');
        const oldScore = matchRoom.players[0].score;
        matchRoom.currentQuestionAnswer = ['choice1'];
        service['calculateScore'](MOCK_ROOM_CODE);
        expect(bonusSpy).toHaveBeenCalled();
        expect(matchRoom.players[0].score).toEqual(oldScore + 36);
        expect(matchRoom.players[1].score).toEqual(oldScore);
    });

    it('calculateScore() should find the fastest responding players', () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue(matchRoom.players);
        const bonusMock = jest.spyOn<any, any>(service, 'computeFastestPlayerBonus');
        matchRoom.currentQuestionAnswer = ['choice1'];
        matchRoom.players[1].answer = matchRoom.players[0].answer;
        service['calculateScore'](MOCK_ROOM_CODE);
        expect(bonusMock).toHaveBeenCalledWith(30, randomDate, matchRoom.players);
    });

    it('calculateScore() should add no bonus if no players got the right answer', () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue(matchRoom.players);
        const bonusMock = jest.spyOn<any, any>(service, 'computeFastestPlayerBonus');
        matchRoom.currentQuestionAnswer = ['impossible'];
        service['calculateScore'](MOCK_ROOM_CODE);
        expect(bonusMock).not.toHaveBeenCalled();
    });

    it('computeFastestPlayerBonus() should add a bonus to the correct player with the fastest time', () => {
        const oldScore = matchRoom.players[0].score;
        const oldBonusCount = matchRoom.players[0].bonusCount;
        const fastestTime = randomDate;
        const correctPlayers = matchRoom.players;
        service['computeFastestPlayerBonus'](30, fastestTime, correctPlayers);
        expect(matchRoom.players[0].score).toEqual(oldScore + BONUS_FACTOR * 30);
        expect(matchRoom.players[0].bonusCount).toEqual(oldBonusCount + 1);
        expect(matchRoom.players[1].bonusCount).toEqual(0);
    });

    it('computeFastestPlayerBonus() should add no bonus if 2 or more players get the right answer at  the same time', () => {
        const oldScore = matchRoom.players[0].score;
        const oldBonusCount = matchRoom.players[0].bonusCount;
        const fastestTime = randomDate;
        const correctPlayers = matchRoom.players;
        correctPlayers[1].answer.timestamp = correctPlayers[0].answer.timestamp;
        service['computeFastestPlayerBonus'](30, fastestTime, correctPlayers);
        expect(matchRoom.players[0].score).toEqual(oldScore);
        expect(matchRoom.players[0].bonusCount).toEqual(oldBonusCount);
        expect(matchRoom.players[1].bonusCount).toEqual(0);
    });

    it("sendFeedback() should emit each player's score and the correct answers when timer expires", () => {
        matchRoom.players[0].score = 10;
        service['sendFeedback'](MOCK_ROOM_CODE);
        const player1Feedback: Feedback = { score: matchRoom.players[0].score, correctAnswer: matchRoom.currentQuestionAnswer };
        const player2Feedback: Feedback = { score: matchRoom.players[1].score, correctAnswer: matchRoom.currentQuestionAnswer };
        expect(player1.socket.emit).toHaveBeenCalledWith('feedback', player1Feedback);
        expect(player1.socket.emit).not.toHaveBeenCalledWith('feedback', player2Feedback);
        expect(player2.socket.emit).toHaveBeenCalledWith('feedback', player2Feedback);
        expect(player2.socket.emit).not.toHaveBeenCalledWith('feedback', player1Feedback);
    });

    it('submitAnswers() should set isSubmitted to true', () => {
        jest.spyOn<any, any>(playerService, 'getPlayerByUsername').mockReturnValue(player2);
        expect(matchRoom.players[1].answer.isSubmitted).toBe(false);
        expect(matchRoom.players[1].answer.timestamp).toBeUndefined();
        service.submitAnswer('player2', MOCK_ROOM_CODE);
        expect(matchRoom.players[1].answer.isSubmitted).toBe(true);
        expect(matchRoom.players[1].answer.timestamp).toBe(randomDate);
    });

    it('submitAnswers() should increment submitted players value', () => {
        matchRoom.submittedPlayers = 0;
        jest.spyOn<any, any>(playerService, 'getPlayerByUsername').mockReturnValue(player2);
        service.submitAnswer('player2', MOCK_ROOM_CODE);
        expect(matchRoom.submittedPlayers).toEqual(1);
    });

    it('updateChoice() should delegate choice tally according to selection', () => {
        player2.answer.isSubmitted = false;
        jest.spyOn<any, any>(playerService, 'getPlayerByUsername').mockReturnValue(player2);
        const updateSpy = jest.spyOn<any, any>(histogramService, 'updateHistogram');
        service.updateChoice('choice1', true, 'player2', MOCK_ROOM_CODE);
        expect(updateSpy).toHaveBeenCalledWith('choice1', true, MOCK_ROOM_CODE);
        service.updateChoice('choice1', false, 'player2', MOCK_ROOM_CODE);
        expect(updateSpy).toHaveBeenCalledWith('choice1', false, MOCK_ROOM_CODE);
    });

    it('updateChoice() should not count selection if answer was already submitted', () => {
        player1.answer.isSubmitted = true;
        jest.spyOn<any, any>(playerService, 'getPlayerByUsername').mockReturnValue(player1);
        service.updateChoice('choice1', true, 'player1', MOCK_ROOM_CODE);
        const updateSpy = jest.spyOn<any, any>(histogramService, 'updateHistogram');
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('onQuestionTimerExpired() should call helper functions when QuestionTimerExpired event is emitted', () => {
        const autoSubmitAnswersSpy = jest.spyOn<any, any>(service, 'autoSubmitAnswers');
        const calculateScoreSpy = jest.spyOn<any, any>(service, 'calculateScore');
        const sendFeedbackSpy = jest.spyOn<any, any>(service, 'sendFeedback');
        const resetPlayersAnswerSpy = jest.spyOn<any, any>(service, 'resetPlayersAnswer');
        matchRoomServiceSpy = jest.spyOn<any, any>(matchRoomService, 'incrementCurrentQuestionIndex');

        eventEmitter.addListener(TimerEvents.QuestionTimerExpired, service.onQuestionTimerExpired);
        expect(eventEmitter.hasListeners(TimerEvents.QuestionTimerExpired)).toBe(true);

        service.onQuestionTimerExpired(MOCK_ROOM_CODE);

        expect(autoSubmitAnswersSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(calculateScoreSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(sendFeedbackSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(resetPlayersAnswerSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);

        eventEmitter.removeListener(TimerEvents.QuestionTimerExpired, service.onQuestionTimerExpired);
    });

    it('handleFinalAnswerSubmitted() should cancel current timer and call score calculating functions if all active players have submitted', () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        matchRoom.activePlayers = 2;
        matchRoom.submittedPlayers = 2;
        const timerSpy = jest.spyOn<any, any>(timeService, 'terminateTimer').mockImplementation();
        const timerExpiredSpy = jest.spyOn<any, any>(service, 'onQuestionTimerExpired');
        service['handleFinalAnswerSubmitted'](matchRoom);
        expect(timerSpy).toHaveBeenCalled();
        expect(timerExpiredSpy).toHaveBeenCalled();
    });

    it('handleFinalAnswerSubmitted() should not cancel timer nor call score calculating functions if not all active players have submitted', () => {
        matchRoom.activePlayers = 2;
        matchRoom.submittedPlayers = 1;
        const timerSpy = jest.spyOn<any, any>(timeService, 'terminateTimer').mockImplementation();
        const timerExpiredSpy = jest.spyOn<any, any>(service, 'onQuestionTimerExpired');
        service['handleFinalAnswerSubmitted'](matchRoom);
        expect(timerSpy).not.toHaveBeenCalled();
        expect(timerExpiredSpy).not.toHaveBeenCalled();
    });

    it('resetPlayersAnswer() should set submittedPlayers value to 0', () => {
        matchRoom.submittedPlayers = 3;
        service['resetPlayersAnswer'](matchRoom.code);
        expect(matchRoom.submittedPlayers).toEqual(0);
    });

    it('resetPlayersAnswer() should set player answer to an empty answer ', () => {
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue([player2]);
        service['resetPlayersAnswer'](matchRoom.code);
        expect(player2.answer.isSubmitted).toBe(false);
        expect(player2.answer.timestamp).toBeUndefined();
        expect(player2.answer.selectedChoices.size).toBe(0);
    });
});

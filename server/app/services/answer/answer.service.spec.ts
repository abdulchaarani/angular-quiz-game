/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Test, TestingModule } from '@nestjs/testing';
import { AnswerService } from './answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Answer } from '@app/model/schema/answer.schema';
import exp from 'constants';

describe('AnswerService', () => {
    let service: AnswerService;
    let matchRoomServiceSpy;
    let mockHostSocket;
    let playerService;
    let matchRoomService;
    const randomDate = 100000;
    let currentDate: number;
    let oldDate: number;

    const matchRoom = { ...MOCK_MATCH_ROOM };
    matchRoom.code = MOCK_ROOM_CODE;

    const player1 = { ...MOCK_PLAYER };
    const selectedChoices1 = new Map<string, boolean>();
    selectedChoices1.set('choice 1', true);
    selectedChoices1.set('choice 2', false);
    player1.username = 'player 1';
    player1.answer = { selectedChoices: selectedChoices1, isSubmited: true, timestamp: randomDate };
    matchRoom.players[0] = player1;

    const player2 = { ...MOCK_PLAYER };
    const selectedChoices2 = new Map<string, boolean>();
    selectedChoices2.set('choice 1', false);
    selectedChoices2.set('choice 2', true);
    player2.username = 'player 2';
    player2.answer = { selectedChoices: selectedChoices2, isSubmited: false };
    matchRoom.players[1] = player2;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AnswerService, MatchRoomService, TimeService, PlayerRoomService, EventEmitter2],
        }).compile();

        service = module.get<AnswerService>(AnswerService);
        matchRoomService = module.get<MatchRoomService>(MatchRoomService);
        playerService = module.get<PlayerRoomService>(PlayerRoomService);
        matchRoomServiceSpy = jest.spyOn(matchRoomService, 'getMatchRoomByCode').mockReturnValue(matchRoom);

        mockHostSocket = {
            send: jest.fn(),
        };
        matchRoom.hostSocket = mockHostSocket;

        service['matchRoomService'].matchRooms = [matchRoom];

        currentDate = randomDate;
        oldDate = currentDate;
        Date.now = jest.fn(() => currentDate);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getMatchRoomByCode() should delegate call to match room service', () => {
        service['getMatchRoomByCode'](MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('updateChoiceTally() should increment the choice tally when the player selects a choice', () => {
        const choice = 'choice';
        const selection = true;
        service['updateChoiceTally'](choice, selection, MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('updateChoiceTally() should decrement the choice tally when the player deselects a choice', () => {
        const choice = 'choice';
        const selection = false;
        service['updateChoiceTally'](choice, selection, MOCK_ROOM_CODE);
        expect(matchRoomServiceSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('updateHistogram() should send the current tally as an array', () => {
        const mockChoiceTally = new ChoiceTally();
        mockChoiceTally.set('choice 1', 1);
        service['updateHistogram'](mockChoiceTally, MOCK_ROOM_CODE);
        expect(mockHostSocket.send).toHaveBeenCalledWith('currentTally', [['choice 1', 1]]);
    });

    it('isCorrectPlayerAnswer() should return true if player has right answer', () => {
        matchRoom.currentQuestionAnswer = ['choice 1'];
        const isCorrect = service['isCorrectPlayerAnswer'](matchRoom.players[0], MOCK_ROOM_CODE);
        expect(isCorrect).toEqual(true);
    });

    it('isCorrectPlayerAnswer() should return false if player has wrong answer', () => {
        jest.spyOn<any, any>(service, 'getMatchRoomByCode').mockReturnValue(matchRoom);
        matchRoom.currentQuestionAnswer = ['choice 2'];
        const isCorrect = service['isCorrectPlayerAnswer'](matchRoom.players[0], MOCK_ROOM_CODE);
        expect(isCorrect).toEqual(false);
    });

    it("filterSelectedChoices() should convert the player's answer to an array of choices", () => {
        const choicesArray = service['filterSelectedChoices'](matchRoom.players[0].answer);
        expect(choicesArray).toContain('choice 1');
        expect(choicesArray).not.toContain('choice 2');
    });

    it("autoSubmitAnswers() should submit every player's answer if not already submitted", () => {
        expect(matchRoom.players[1].answer.isSubmited).toBe(false);
        expect(matchRoom.players[0].answer.timestamp).toBe(currentDate);
        currentDate += 1000;
        service['autoSubmitAnswers'](MOCK_ROOM_CODE);
        expect(matchRoom.players[1].answer.isSubmited).toBe(true);
        expect(matchRoom.players[0].answer.timestamp).toBe(oldDate);
        expect(matchRoom.players[1].answer.timestamp).toBe(currentDate);
    });

    it("getCurrentQuestionValue() should return the current question's points weight", () => {
        const score = service['getCurrentQuestionValue'](MOCK_ROOM_CODE);
        expect(score).toEqual(30);
    });

    it("calculateScore() should add to the player's score only if they had the correct answer", () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue(matchRoom.players);
        const oldScore = matchRoom.players[0].score;
        matchRoom.currentQuestionAnswer = ['choice 1'];
        service['calculateScore'](MOCK_ROOM_CODE);
        expect(matchRoom.players[0].score).toEqual(oldScore + 36);
        expect(matchRoom.players[1].score).toEqual(oldScore);
    });

    it('calculateScore() should find the fastest responding players', () => {
        jest.spyOn<any, any>(service, 'getCurrentQuestionValue').mockReturnValue(30);
        jest.spyOn<any, any>(playerService, 'getPlayers').mockReturnValue(matchRoom.players);
        const bonusMock = jest.spyOn<any, any>(service, 'computeFastestPlayerBonus');
        matchRoom.currentQuestionAnswer = ['choice 1'];
        matchRoom.players[1].answer = matchRoom.players[0].answer;
        service['calculateScore'](MOCK_ROOM_CODE);
        expect(bonusMock).toHaveBeenCalledWith(30, randomDate, matchRoom.players);
    });
});

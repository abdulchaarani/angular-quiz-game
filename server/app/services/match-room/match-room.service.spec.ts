/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { MOCK_CHOICES, getMockGame } from '@app/constants/game-mocks';
import { INVALID_CODE, LOCKED_ROOM } from '@app/constants/match-login-errors';
import { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { getMockQuestion } from '@app/constants/question-mocks';
import { ChoiceTracker } from '@app/model/choice-tracker/choice-tracker';
import { PlayerInfo } from '@app/model/schema/answer.schema';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { TimeService } from '@app/services/time/time.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { MatchRoomService } from './match-room.service';

const MAXIMUM_CODE_LENGTH = 4;
const MOCK_YEAR = 2024;
const MOCK_DATE = new Date(MOCK_YEAR, 1, 1);
describe('MatchRoomService', () => {
    let service: MatchRoomService;
    let timeService: TimeService;
    let socket: SinonStubbedInstance<Socket>;
    let startTimerMock: jest.Mock;
    let mockServer;
    let mockSocket;
    let emitMock;
    let mockHostSocket;

    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchRoomService, TimeService, EventEmitter2],
        }).compile();

        service = module.get<MatchRoomService>(MatchRoomService);
        timeService = module.get<TimeService>(TimeService);
        startTimerMock = jest.fn();
        timeService.startTimer = startTimerMock;

        emitMock = jest.fn();
        mockServer = {
            in: jest.fn().mockReturnValueOnce({ emit: emitMock }),
        };

        mockSocket = {
            to: jest.fn().mockReturnValueOnce({ emit: emitMock }),
        };

        mockHostSocket = {
            send: jest.fn(),
        };
    });
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_DATE);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('generateRoomCode() should generate a random 4 number room code', () => {
        jest.spyOn(service, 'getRoom').mockReturnValue(undefined);
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const result = service.generateRoomCode();
        expect(result.length).toEqual(MAXIMUM_CODE_LENGTH);
        expect(isNaN(Number(result))).toBeFalsy();
    });

    it('getRoom() should return the MatchRoom with the corresponding code', () => {
        const searchedMatchRoom = MOCK_MATCH_ROOM;
        searchedMatchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [MOCK_MATCH_ROOM, searchedMatchRoom];
        const foundRoom = service.getRoom(MOCK_ROOM_CODE);
        expect(foundRoom).toEqual(searchedMatchRoom);
    });

    it('getRoom() should return undefined if no match room with the corresponding code is found', () => {
        const foundRoom = service.getRoom(MOCK_ROOM_CODE);
        expect(foundRoom).toEqual(undefined);
    });

    it('getRoom() should return the index of the corresponding room', () => {
        const searchedRoom: MatchRoom = {
            code: MOCK_ROOM_CODE,
            isLocked: false,
            isPlaying: false,
            game: getMockGame(),
            bannedUsernames: [],
            players: [],
            messages: [],
            hostSocket: undefined,
        } as MatchRoom;
        service.matchRooms = [searchedRoom, MOCK_MATCH_ROOM];
        const result = service.getRoomIndex(MOCK_ROOM_CODE);
        expect(result).toEqual(0);
    });

    it('addRoom() should generate a room code add the new MatchRoom in the rooms list', () => {
        service.matchRooms = [];
        const generateSpy = jest.spyOn(service, 'generateRoomCode').mockReturnValue(MOCK_ROOM_CODE);
        const mockGame = getMockGame();
        const expectedResult: MatchRoom = {
            code: MOCK_ROOM_CODE,
            hostSocket: socket,
            isLocked: false,
            isPlaying: false,
            game: mockGame,
            gameLength: 1,
            currentQuestionIndex: 0,
            currentQuestionAnswer: [],
            currentChoiceTracker: new ChoiceTracker(),
            matchHistograms: [],
            bannedUsernames: [],
            players: [],
            activePlayers: 0,
            submittedPlayers: 0,
            messages: [],
            isTestRoom: false,
            startTime: new Date(),
        };

        const result = service.addRoom(mockGame, socket);
        expect(generateSpy).toHaveBeenCalled();
        expect(result).toEqual(expectedResult);
        expect(service.matchRooms.length).toEqual(1);
    });

    it('getRoomCodeByHostSocket() should return code of the room where the host belongs', () => {
        const searchedMatchRoom = MOCK_MATCH_ROOM;
        searchedMatchRoom.code = MOCK_ROOM_CODE;
        searchedMatchRoom.hostSocket = socket;
        service.matchRooms = [MOCK_MATCH_ROOM, searchedMatchRoom];
        const result = service.getRoomCodeByHostSocket(socket.id);
        expect(result).toEqual(MOCK_ROOM_CODE);
    });

    it('getRoomCodeByHostSocket() should return undefined if no room where the host belongs is found', () => {
        service.matchRooms = [MOCK_MATCH_ROOM];
        const result = service.getRoomCodeByHostSocket(MOCK_ROOM_CODE);
        expect(result).toEqual(undefined);
    });

    it('toggleLock() should toggle the isLocked property', () => {
        const lockStates = [true, false];
        lockStates.forEach((lockState: boolean) => {
            const matchRoom = MOCK_MATCH_ROOM;
            matchRoom.isLocked = lockState;
            jest.spyOn(service, 'getRoom').mockReturnValue(matchRoom);
            service.toggleLock(MOCK_MATCH_ROOM.code);
            expect(matchRoom.isLocked).toEqual(!lockState);
        });
    });

    it('deleteRoom() should delete the MatchRoom with the corresponding code', () => {
        const deletedMatchRoom = MOCK_MATCH_ROOM;
        deletedMatchRoom.code = MOCK_ROOM_CODE;
        const otherMatchRoom: MatchRoom = {
            code: '',
            isLocked: false,
            isPlaying: false,
            game: getMockGame(),
            bannedUsernames: [],
            players: [],
            messages: [],
            hostSocket: undefined,
        } as MatchRoom;
        service.matchRooms = [otherMatchRoom, deletedMatchRoom];
        service.deleteRoom(MOCK_ROOM_CODE);
        expect(service.matchRooms.length).toEqual(1);
        expect(service.matchRooms.find((room: MatchRoom) => room === deletedMatchRoom)).toBeFalsy();
    });

    it('getRoomCodeErrors() should return empty string if the room is found and is not locked', () => {
        const validRoom = MOCK_MATCH_ROOM;
        validRoom.isLocked = false;
        jest.spyOn(service, 'getRoom').mockReturnValue(MOCK_MATCH_ROOM);
        const result = service.getRoomCodeErrors(validRoom.code);
        expect(result).toEqual('');
    });

    it('getRoomCodeErrors() should return LOCKED_ROOM error if the room is found and is locked', () => {
        const invalidRoom = MOCK_MATCH_ROOM;
        invalidRoom.isLocked = true;
        jest.spyOn(service, 'getRoom').mockReturnValue(MOCK_MATCH_ROOM);
        const result = service.getRoomCodeErrors(invalidRoom.code);
        expect(result).toEqual(LOCKED_ROOM);
    });

    it('getRoomCodeErrors() should return INVALID_CODE if the room is not found', () => {
        jest.spyOn(service, 'getRoom').mockReturnValue(undefined);
        const result = service.getRoomCodeErrors('');
        expect(result).toEqual(INVALID_CODE);
    });

    it('canStartMatch() should return true if room is locked and has at least one player', () => {
        const validRoom = MOCK_MATCH_ROOM;
        validRoom.isLocked = true;
        validRoom.players = [MOCK_PLAYER];
        jest.spyOn(service, 'getRoom').mockReturnValue(MOCK_MATCH_ROOM);
        const result = service['canStartMatch']('');
        expect(result).toBeTruthy();
    });

    it('canStartMatch() should return false if room is not locked or has zero player', () => {
        const unlockedRoom = MOCK_MATCH_ROOM;
        unlockedRoom.isLocked = false;
        unlockedRoom.players = [MOCK_PLAYER];

        const noPlayerRoom = MOCK_MATCH_ROOM;
        noPlayerRoom.players = [];
        noPlayerRoom.isLocked = true;

        const totallyInvalidRoom = MOCK_MATCH_ROOM;
        totallyInvalidRoom.isLocked = false;
        totallyInvalidRoom.players = [];

        const invalidRooms = [unlockedRoom, noPlayerRoom, totallyInvalidRoom, undefined];
        invalidRooms.forEach((room: MatchRoom) => {
            jest.spyOn(service, 'getRoom').mockReturnValue(room);
            expect(service['canStartMatch']('')).toBeFalsy();
        });
    });

    it('incrementCurrentQuestionIndex() should increment currentQuestionIndex when called', () => {
        service.matchRooms.push(MOCK_MATCH_ROOM);
        expect(service.getRoom(MOCK_ROOM_CODE).currentQuestionIndex).toEqual(0);
        service.incrementCurrentQuestionIndex(MOCK_ROOM_CODE);
        expect(service.getRoom(MOCK_ROOM_CODE).currentQuestionIndex).toEqual(1);
    });

    it('startMatch() should start match and timer with a 5 seconds countdown', () => {
        service.matchRooms = [MOCK_MATCH_ROOM];
        jest.spyOn(service, 'getRoomIndex').mockReturnValue(0);

        jest.spyOn<any, any>(service, 'canStartMatch').mockReturnValue(true);
        jest.spyOn<any, any>(service, 'getGameTitle').mockReturnValue('game1');
        service.startMatch(mockSocket, null, MOCK_ROOM_CODE);
        const playerInfo: PlayerInfo = { gameTitle: 'game1', start: true };
        expect(emitMock).toHaveBeenCalledWith('matchStarting', playerInfo);
        expect(startTimerMock).toHaveBeenCalledWith(null, MOCK_ROOM_CODE, 5, ExpiredTimerEvents.CountdownTimerExpired);
    });

    it('startMatch() should not start the match nor the timer if match is not in a valid state', () => {
        jest.spyOn<any, any>(service, 'canStartMatch').mockReturnValue(false);
        jest.spyOn<any, any>(service, 'getGameTitle').mockReturnValue('game1');
        service.startMatch(mockSocket, null, MOCK_ROOM_CODE);
        expect(emitMock).not.toHaveBeenCalled();
        expect(startTimerMock).not.toHaveBeenCalled();
    });

    it('startNextQuestionCooldown() should start timer with a 3 seconds countdown', () => {
        service.startNextQuestionCooldown(mockServer, MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith('startCooldown', MOCK_ROOM_CODE);
        expect(startTimerMock).toHaveBeenCalledWith(mockServer, MOCK_ROOM_CODE, 3, ExpiredTimerEvents.CooldownTimerExpired);
    });

    it('sendFirstQuestion() should emit the first question along with the game duration', () => {
        const matchRoom = MOCK_PLAYER_ROOM;
        matchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [matchRoom];
        matchRoom.hostSocket = mockHostSocket;
        const currentQuestion = matchRoom.game.questions[0];
        const currentAnswers = currentQuestion.choices[0].text;
        service.sendFirstQuestion(mockServer, MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith('beginQuiz', {
            firstQuestion: currentQuestion,
            gameDuration: matchRoom.game.duration,
            isTestRoom: false,
        });
        expect(mockHostSocket.send).toHaveBeenCalledWith('currentAnswers', [currentAnswers]);
        expect(startTimerMock).toHaveBeenCalledWith(mockServer, MOCK_ROOM_CODE, matchRoom.game.duration, ExpiredTimerEvents.QuestionTimerExpired);
    });

    it('sendNextQuestion() should emit gameOver if last question', () => {
        const matchRoom = { ...MOCK_PLAYER_ROOM };
        matchRoom.currentQuestionIndex = 2;
        matchRoom.gameLength = 2;
        matchRoom.isTestRoom = true;
        jest.spyOn(service, 'getRoom').mockReturnValue(matchRoom);
        service.sendNextQuestion(mockServer, matchRoom.code);
        expect(emitMock).toHaveBeenCalledWith('gameOver', true);
    });

    it('sendNextQuestion() should emit the next question if there are any and start a timer with the game duration as its value', () => {
        const matchRoom = MOCK_PLAYER_ROOM;
        matchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [matchRoom];
        matchRoom.currentQuestionIndex = 0;
        matchRoom.hostSocket = mockHostSocket;
        const currentQuestion = matchRoom.game.questions[0];
        service.sendNextQuestion(mockServer, MOCK_ROOM_CODE);
        expect(emitMock).toHaveBeenCalledWith('nextQuestion', currentQuestion);
        expect(startTimerMock).toHaveBeenCalledWith(mockServer, MOCK_ROOM_CODE, matchRoom.game.duration, ExpiredTimerEvents.QuestionTimerExpired);
    });

    it('markGameAsPlaying() should set match room isPlaying to true', () => {
        const matchRoom = MOCK_MATCH_ROOM;
        matchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [matchRoom];
        matchRoom.isPlaying = false;
        service.markGameAsPlaying(MOCK_ROOM_CODE);
        expect(matchRoom.isPlaying).toEqual(true);
    });

    it('isGamePlaying() should return true if isPlaying is true', () => {
        const matchRoom = MOCK_MATCH_ROOM;
        matchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [matchRoom];
        service.markGameAsPlaying(MOCK_ROOM_CODE);
        expect(service.isGamePlaying(MOCK_ROOM_CODE)).toEqual(true);
    });

    it('filterCorrectChoices() should return a list of correct choices', () => {
        let correctChoices = ['previous correct choice'];
        const question = getMockQuestion();
        question.choices = MOCK_CHOICES;
        correctChoices = service['filterCorrectChoices'](question);
        expect(correctChoices).not.toContain('previous correct choice');
        expect(correctChoices).toContain(question.choices[0].text);
        expect(correctChoices).not.toContain(question.choices[1].text);
    });

    it('removeIsCorrectField() should remove isCorrect answer from choices', () => {
        const question = getMockQuestion();
        question.choices = MOCK_CHOICES;
        service['removeIsCorrectField'](question);
        expect(question.choices[0].isCorrect).toBeUndefined();
        expect(question.choices[1].isCorrect).toBeUndefined();
    });

    it('getGameDuration() should return the current game duration', () => {
        service.matchRooms = [MOCK_MATCH_ROOM];
        const currentGameDuration = service['getGameDuration'](MOCK_ROOM_CODE);
        expect(currentGameDuration).toEqual(getMockGame().duration);
    });

    it('getGameTitle() should return the current game title', () => {
        service.matchRooms = [MOCK_MATCH_ROOM];
        service.matchRooms[0].game.title = 'game1';
        const currentGameDuration = service['getGameTitle'](MOCK_ROOM_CODE);
        expect(currentGameDuration).toEqual('game1');
    });
});

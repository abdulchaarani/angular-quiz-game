import { getMockGame } from '@app/constants/game-mocks';
import { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { MatchRoomService } from './match-room.service';
import { TimeService } from '@app/services/time/time.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChoiceTally } from '@app/model/choice-tally/choice-tally';
import exp from 'constants';
import { getMockQuestion } from '@app/constants/question-mocks';
import { getRandomString } from '@app/constants/test-utils';

const MAXIMUM_CODE_LENGTH = 4;

describe('MatchRoomService', () => {
    let service: MatchRoomService;
    let socket: SinonStubbedInstance<Socket>;
    beforeEach(async () => {
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchRoomService, TimeService, EventEmitter2],
        }).compile();

        service = module.get<MatchRoomService>(MatchRoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('generateRoomCode() should generate a random 4 number room code', () => {
        jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(undefined);
        jest.spyOn(Math, 'random').mockReturnValue(0);
        const result = service.generateRoomCode();
        expect(result.length).toEqual(MAXIMUM_CODE_LENGTH);
        expect(isNaN(Number(result))).toBeFalsy();
    });

    it('getMatchRoomByCode() should return the MatchRoom with the corresponding code', () => {
        const searchedMatchRoom = MOCK_MATCH_ROOM;
        searchedMatchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [MOCK_MATCH_ROOM, searchedMatchRoom];
        const foundRoom = service.getMatchRoomByCode(MOCK_ROOM_CODE);
        expect(foundRoom).toEqual(searchedMatchRoom);
    });

    it('getMatchRoomByCode() should return undefined if no match room with the corresponding code is found', () => {
        const foundRoom = service.getMatchRoomByCode(MOCK_ROOM_CODE);
        expect(foundRoom).toEqual(undefined);
    });

    it('getMatchRoomByCode() should return the index of the corresponding room', () => {
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
        const result = service.getRoomIndexByCode(MOCK_ROOM_CODE);
        expect(result).toEqual(0);
    });

    it('addMatchRoom() should generate a room code add the new MatchRoom in the rooms list', () => {
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
            choiceTally: new ChoiceTally(),
            bannedUsernames: [],
            players: [],
            messages: [],
        };
        const result = service.addMatchRoom(mockGame, socket);
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

    it('toggleLockMatchRoom() should toggle the isLocked property', () => {
        const lockStates = [true, false];
        lockStates.forEach((lockState: boolean) => {
            const matchRoom = MOCK_MATCH_ROOM;
            matchRoom.isLocked = lockState;
            jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(matchRoom);
            service.toggleLockMatchRoom(MOCK_MATCH_ROOM.code);
            expect(matchRoom.isLocked).toEqual(!lockState);
        });
    });

    it('deleteMatchRoom() should delete the MatchRoom with the corresponding code', () => {
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
        service.deleteMatchRoom(MOCK_ROOM_CODE);
        expect(service.matchRooms.length).toEqual(1);
        expect(service.matchRooms.find((room: MatchRoom) => room === deletedMatchRoom)).toBeFalsy();
    });

    it('isValidMatchRoomCode() should return true if the room is found and is not locked', () => {
        const validRoom = MOCK_MATCH_ROOM;
        validRoom.isLocked = false;
        jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(MOCK_MATCH_ROOM);
        const result = service.isValidMatchRoomCode('');
        expect(result).toBeTruthy();
    });

    it('isValidMatchRoomCode() should return false if the room is found and is locked', () => {
        const validRoom = MOCK_MATCH_ROOM;
        validRoom.isLocked = true;
        jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(MOCK_MATCH_ROOM);
        const result = service.isValidMatchRoomCode('');
        expect(result).toBeFalsy();
    });

    it('isValidMatchRoomCode() should return false if the room is not found', () => {
        jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(undefined);
        const result = service.isValidMatchRoomCode('');
        expect(result).toBeFalsy();
    });

    it('canStartMatch() should return true if room is locked and has at least one player', () => {
        const validRoom = MOCK_MATCH_ROOM;
        validRoom.isLocked = true;
        validRoom.players = [MOCK_PLAYER];
        jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(MOCK_MATCH_ROOM);
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
            jest.spyOn(service, 'getMatchRoomByCode').mockReturnValue(room);
            expect(service['canStartMatch']('')).toBeFalsy();
        });
    });

    it('resetChoiceTally() should reset the current choice tally with the appropriate choices', () => {
        const matchRoom = MOCK_MATCH_ROOM;
        matchRoom.code = MOCK_ROOM_CODE;
        service.matchRooms = [matchRoom];

        const currentChoiceTally = new ChoiceTally();
        currentChoiceTally.set(getRandomString(), 0);
        currentChoiceTally.set(getRandomString(), 1);
        currentChoiceTally.set(getRandomString(), 2);
        currentChoiceTally.set(getRandomString(), 3);

        matchRoom.choiceTally = currentChoiceTally;
        service['resetChoiceTally'](MOCK_ROOM_CODE);

        expect(matchRoom.choiceTally.size).toBe(2);
        expect(matchRoom.choiceTally.has(matchRoom.game.questions[0].choices[0].text)).toBeTruthy();
        expect(matchRoom.choiceTally.has(matchRoom.game.questions[0].choices[1].text)).toBeTruthy();
        expect(matchRoom.choiceTally.get(matchRoom.game.questions[0].choices[0].text)).toBe(0);
        expect(matchRoom.choiceTally.get(matchRoom.game.questions[0].choices[1].text)).toBe(0);
    });

    it('getGameDuration() should return the current game duration', () => {
        service.matchRooms = [MOCK_MATCH_ROOM];
        const currentGameDuration = service['getGameDuration'](MOCK_ROOM_CODE);
        expect(currentGameDuration).toEqual(getMockGame().duration);
    });
});

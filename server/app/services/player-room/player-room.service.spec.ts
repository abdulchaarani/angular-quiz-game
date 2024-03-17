import { MOCK_MATCH_ROOM, MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_ROOM_CODE, MOCK_USERNAME } from '@app/constants/match-mocks';
import { Player } from '@app/model/schema/player.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Socket } from 'socket.io';
import { PlayerRoomService } from './player-room.service';

describe('PlayerRoomService', () => {
    let service: PlayerRoomService;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let socket: SinonStubbedInstance<Socket>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        socket = createStubInstance<Socket>(Socket);
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerRoomService, { provide: MatchRoomService, useValue: matchRoomSpy }],
        }).compile();

        service = module.get<PlayerRoomService>(PlayerRoomService);
        jest.spyOn(matchRoomSpy, 'getMatchRoomByCode').mockReturnValue(MOCK_PLAYER_ROOM);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getPlayers() should return an array of players in the MatchRoom with the corresponding code', () => {
        const result = service.getPlayers('');
        expect(result).toEqual([MOCK_PLAYER]);
    });

    it('getPlayersStringified() should return the list of stringified players without socket attribute', () => {
        jest.spyOn(service, 'getPlayers').mockReturnValue([MOCK_PLAYER]);
        const expectedResult = '[{"username":"","answer":{"selectedChoices":{},"isSubmitted":false},"score":0,"bonusCount":0,"isPlaying":true}]';
        const result = service.getPlayersStringified('');
        expect(result).toEqual(expectedResult);
    });

    it('addPlayer() should not add player if the username is invalid', () => {
        const validateSpy = jest.spyOn(service, 'isValidUsername').mockReturnValue(false);
        const result = service.addPlayer(socket, '', '');
        expect(result).toBeFalsy();
        expect(validateSpy).toHaveBeenCalled();
    });

    it('addPlayer() should add the player if the username is valid', () => {
        const validateSpy = jest.spyOn(service, 'isValidUsername').mockReturnValue(true);
        const pushSpy = jest.spyOn(Array.prototype, 'push');
        const mockUsername = 'mock';
        const expectedResult: Player = {
            username: mockUsername,
            answer: { selectedChoices: new Map<string, boolean>(), isSubmitted: false },
            score: 0,
            bonusCount: 0,
            isPlaying: true,
            socket,
        };
        const result = service.addPlayer(socket, '', mockUsername);
        expect(result).toEqual(expectedResult);
        expect(validateSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('deletePlayerBySocket() should delete the player if the foundMatchRoom is not playing yet', () => {
        const mockRoom = MOCK_PLAYER_ROOM;
        mockRoom.isPlaying = false;
        const mockPlayer = MOCK_PLAYER;
        mockPlayer.socket = socket;
        mockRoom.players = [mockPlayer];
        matchRoomSpy.matchRooms = [mockRoom];

        const deleteSpy = jest.spyOn(service, 'deletePlayer').mockReturnThis();
        const inactiveSpy = jest.spyOn(service, 'makePlayerInactive').mockReturnThis();

        const result = service.deletePlayerBySocket(socket.id);
        expect(result).toEqual(MOCK_PLAYER_ROOM.code);
        expect(deleteSpy).toHaveBeenCalled();
        expect(inactiveSpy).not.toHaveBeenCalled();
    });

    it('deletePlayerBySocket() should make the player inactive if the foundMatchRoom is playing', () => {
        const mockRoom = MOCK_PLAYER_ROOM;
        mockRoom.isPlaying = true;
        const mockPlayer = MOCK_PLAYER;
        mockPlayer.socket = socket;
        mockRoom.players = [mockPlayer];
        matchRoomSpy.matchRooms = [mockRoom];

        const deleteSpy = jest.spyOn(service, 'deletePlayer').mockReturnThis();
        const inactiveSpy = jest.spyOn(service, 'makePlayerInactive').mockReturnThis();

        const result = service.deletePlayerBySocket(socket.id);
        expect(result).toEqual(MOCK_PLAYER_ROOM.code);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(inactiveSpy).toHaveBeenCalled();
    });

    it('deletePlayerBySocket() should return undefined if player and room are not found', () => {
        matchRoomSpy.matchRooms = [MOCK_MATCH_ROOM];

        const deleteSpy = jest.spyOn(service, 'deletePlayer').mockReturnThis();
        const inactiveSpy = jest.spyOn(service, 'makePlayerInactive').mockReturnThis();

        const result = service.deletePlayerBySocket('');
        expect(result).toEqual(undefined);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(inactiveSpy).not.toHaveBeenCalled();
    });

    it('getPlayerByusername() should return the player with the corresponding username (non case sensitive)', () => {
        const searchedPlayer = MOCK_PLAYER;
        searchedPlayer.username = MOCK_USERNAME;
        const otherPlayer: Player = {
            username: '',
            score: 0,
            bonusCount: 0,
            isPlaying: false,
            socket: undefined,
        } as Player;
        jest.spyOn(service, 'getPlayers').mockReturnValue([searchedPlayer, otherPlayer]);
        expect(service.getPlayerByUsername('', searchedPlayer.username)).toEqual(searchedPlayer);
        expect(service.getPlayerByUsername('', searchedPlayer.username.toUpperCase())).toEqual(searchedPlayer);
    });

    it('makePlayerInactive() should set the player isPlaying property to false', () => {
        const cases = [true, false];
        cases.forEach((playingState: boolean) => {
            const mockRoom = MOCK_PLAYER_ROOM;
            const mockPlayer = MOCK_PLAYER;
            const mockUsername = MOCK_USERNAME;
            mockPlayer.username = mockUsername;
            mockPlayer.isPlaying = playingState;
            mockRoom.players = [mockPlayer];
            matchRoomSpy.matchRooms = [mockRoom];

            jest.spyOn(matchRoomSpy, 'getRoomIndexByCode').mockReturnValue(0);
            jest.spyOn(matchRoomSpy, 'getMatchRoomByCode').mockClear();
            jest.spyOn(matchRoomSpy, 'getMatchRoomByCode').mockReturnValue(mockRoom);
            service.makePlayerInactive('', mockUsername);
            expect(matchRoomSpy.matchRooms[0].players[0].isPlaying).toBeFalsy();
        });
    });

    it('deletePlayer() should remove player from the MatchRoom', () => {
        const mockRoom = MOCK_PLAYER_ROOM;
        const mockPlayer = MOCK_PLAYER;
        mockPlayer.username = MOCK_USERNAME;
        mockRoom.players = [mockPlayer];
        matchRoomSpy.matchRooms = [mockRoom];

        jest.spyOn(matchRoomSpy, 'getRoomIndexByCode').mockReturnValue(0);
        service.deletePlayer('', MOCK_USERNAME);
        expect(matchRoomSpy.matchRooms[0].players.length).toEqual(0);
    });

    it('getBannedUsernames() should return banned usernames', () => {
        const mockRoom = MOCK_PLAYER_ROOM;
        mockRoom.bannedUsernames = [MOCK_USERNAME];
        matchRoomSpy.matchRooms = [mockRoom];
        expect(service.getBannedUsernames('')).toEqual([MOCK_USERNAME]);
    });

    it('addBannedUsernames() should add username to bannedUsernames list from matchRoomService', () => {
        const pushSpy = jest.spyOn(Array.prototype, 'push');
        service.addBannedUsername('', MOCK_USERNAME);
        expect(pushSpy).toHaveBeenCalledWith(MOCK_USERNAME.toUpperCase());
    });

    it('isBannedUsername() should return true if username is banned', () => {
        jest.spyOn(service, 'getBannedUsernames').mockReturnValue([MOCK_USERNAME]);
        expect(service.isBannedUsername('', MOCK_USERNAME)).toEqual(true);
    });

    it('isBannedUsername() should return false if username is not banned', () => {
        jest.spyOn(service, 'getBannedUsernames').mockReturnValue([]);
        expect(service.isBannedUsername('', MOCK_USERNAME)).toEqual(false);
    });

    it('isValidUsername() should return true only if username is valid (not host, not banned, and not used)', () => {
        const testCases = [
            { username: MOCK_USERNAME, isBanned: false, isUsed: false, expectedResult: true },
            { username: 'Organisateur', isBanned: false, isUsed: false, expectedResult: false },
            { username: MOCK_USERNAME, isBanned: true, isUsed: false, expectedResult: false },
            { username: MOCK_USERNAME, isBanned: false, isUsed: true, expectedResult: false },
            { username: MOCK_USERNAME, isBanned: true, isUsed: true, expectedResult: false },
        ];
        for (const { username, isBanned, isUsed, expectedResult } of testCases) {
            const banSpy = jest.spyOn(service, 'isBannedUsername').mockReturnValue(isBanned);
            const usedSpy = jest.spyOn(service, 'getPlayerByUsername').mockReturnValue(isUsed ? MOCK_PLAYER : undefined);
            const result = service.isValidUsername('', username);
            expect(banSpy).toHaveBeenCalled();
            expect(usedSpy).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        }
    });

    it('isValidUsername() should always return true if used in testPage', () => {
        matchRoomSpy.getMatchRoomByCode(MOCK_ROOM_CODE).isTestRoom = true;
        const result = service.isValidUsername(MOCK_ROOM_CODE, 'caca');
        expect(result).toBe(true);
    });
});

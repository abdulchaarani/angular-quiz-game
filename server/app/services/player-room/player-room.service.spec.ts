import { MOCK_PLAYER, MOCK_PLAYER_ROOM, MOCK_USERNAME } from '@app/constants/match-mocks';
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
        const expectedResult = '[{"username":"","score":0,"bonusCount":0,"isPlaying":true}]';
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
            score: 0,
            bonusCount: 0,
            isPlaying: true,
            socket: socket,
        };
        const result = service.addPlayer(socket, '', mockUsername);
        expect(result).toEqual(expectedResult);
        expect(validateSpy).toHaveBeenCalled();
        expect(pushSpy).toHaveBeenCalled();
    });

    it('deletePlayerBySocket() should delete the player if the foundMatchRoom is not playing yet', () => {
        let mockRoom = MOCK_PLAYER_ROOM;
        mockRoom.isPlaying = false;
        let mockPlayer = MOCK_PLAYER;
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
        let mockRoom = MOCK_PLAYER_ROOM;
        mockRoom.isPlaying = true;
        let mockPlayer = MOCK_PLAYER;
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
        matchRoomSpy.matchRooms = [];

        const deleteSpy = jest.spyOn(service, 'deletePlayer').mockReturnThis();
        const inactiveSpy = jest.spyOn(service, 'makePlayerInactive').mockReturnThis();

        const result = service.deletePlayerBySocket('');
        expect(result).toEqual(undefined);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(inactiveSpy).not.toHaveBeenCalled();
    });

    it('getPlayerByusername() should return the player with the corresponding username (non case sensitive)', () => {
        let searchedPlayer = MOCK_PLAYER;
        searchedPlayer.username = MOCK_USERNAME;
        let otherPlayer: Player = {
            username: '',
            score: 0,
            bonusCount: 0,
            isPlaying: false,
            socket: undefined,
        };
        jest.spyOn(service, 'getPlayers').mockReturnValue([searchedPlayer, otherPlayer]);
        expect(service.getPlayerByUsername('', searchedPlayer.username)).toEqual(searchedPlayer);
        expect(service.getPlayerByUsername('', searchedPlayer.username.toUpperCase())).toEqual(searchedPlayer);
    });

    it('makePlayerInactive() should set the player isPlaying property to false', () => {
        const cases = [true, false];
        cases.forEach((playingState: boolean) => {
            let mockRoom = MOCK_PLAYER_ROOM;
            let mockPlayer = MOCK_PLAYER;
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
        let mockRoom = MOCK_PLAYER_ROOM;
        let mockPlayer = MOCK_PLAYER;
        mockPlayer.username = MOCK_USERNAME;
        mockRoom.players = [mockPlayer];
        matchRoomSpy.matchRooms = [mockRoom];

        jest.spyOn(matchRoomSpy, 'getRoomIndexByCode').mockReturnValue(0);
        service.deletePlayer('', MOCK_USERNAME);
        expect(matchRoomSpy.matchRooms[0].players.length).toEqual(0);
    });
});

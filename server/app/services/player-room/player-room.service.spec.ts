import { MOCK_PLAYER, MOCK_PLAYER_ROOM } from '@app/constants/match-mocks';
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
});

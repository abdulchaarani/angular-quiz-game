import { getMockGame } from '@app/constants/game-mocks';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Player } from '@app/model/schema/player.schema';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { MatchGateway } from './match.gateway';
const MOCK_USER_INFO = { roomCode: '', username: '' };
const MOCK_PLAYER: Player = {
    username: '',
    score: 0,
    bonusCount: 0,
    isPlaying: true,
    socket: undefined,
};
const MOCK_MATCH_ROOM: MatchRoom = {
    code: '',
    isLocked: false,
    isPlaying: false,
    game: getMockGame(),
    bannedUsernames: [],
    players: [],
    messages: [],
    hostSocket: undefined,
};
const MOCK_ROOM_CODE = 'mockCode';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let matchBackupSpy: SinonStubbedInstance<MatchBackupService>;
    let timeSpy: SinonStubbedInstance<TimeService>;
    let playerRoomSpy: SinonStubbedInstance<PlayerRoomService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        matchBackupSpy = createStubInstance(MatchBackupService);
        timeSpy = createStubInstance(TimeService);
        playerRoomSpy = createStubInstance(PlayerRoomService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: MatchBackupService, useValue: matchBackupSpy },
                { provide: TimeService, useValue: timeSpy },
                { provide: PlayerRoomService, useValue: playerRoomSpy },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('joinRoom() should let the player join if the room code and the username are valid', () => {
        matchRoomSpy.isValidMatchRoomCode.returns(true);
        playerRoomSpy.isValidUsername.returns(true);
        playerRoomSpy.addPlayer.returns(MOCK_PLAYER);
        const result = gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeTruthy();
        expect(playerRoomSpy.addPlayer.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_USER_INFO.roomCode, username: MOCK_PLAYER.username });
    });

    it('joinRoom() should not let the player join if the room code or the username are invalid', () => {
        matchRoomSpy.isValidMatchRoomCode.returns(false);
        playerRoomSpy.isValidUsername.returns(false);
        server.in.returns({
            disconnectSockets: () => {},
        } as BroadcastOperator<unknown, unknown>);

        gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeFalsy();
    });

    it('createRoom() should let the host create a match room and let the host join the new room', () => {
        matchRoomSpy.addMatchRoom.returns(MOCK_MATCH_ROOM);
        const result = gateway.createRoom(socket, JSON.stringify(MOCK_MATCH_ROOM.game));
        expect(socket.join.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_MATCH_ROOM.code });
    });

    it('toggleLock() should call toggleLockMatchRoom', () => {
        const toggleSpy = jest.spyOn(matchRoomSpy, 'toggleLockMatchRoom').mockImplementation(() => {});
        gateway.toggleLock(socket, '');
        expect(toggleSpy).toHaveBeenCalled();
    });

    it('banUsername() should add username to banned usernames list, and delete player if applicable, then update list', () => {
        const addBannedUsernameSpy = jest.spyOn(playerRoomSpy, 'addBannedUsername').mockReturnThis();
        let mockPlayer = MOCK_PLAYER;
        mockPlayer.socket = socket;
        const playerSpy = jest.spyOn(playerRoomSpy, 'getPlayerByUsername').mockReturnValue(mockPlayer);
        const deleteSpy = jest.spyOn(playerRoomSpy, 'deletePlayer').mockReturnThis();
        server.in.returns({
            disconnectSockets: () => {},
        } as BroadcastOperator<unknown, unknown>);
        const sendSpy = jest.spyOn(gateway, 'sendPlayersData').mockReturnThis();
        gateway.banUsername(socket, MOCK_USER_INFO);
        expect(addBannedUsernameSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(playerSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(deleteSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(sendSpy).toHaveBeenCalledWith(socket, MOCK_USER_INFO.roomCode);
    });

    it('banUsername() should add username to banned usernames list then update list (if player is not found)', () => {
        const addBannedUsernameSpy = jest.spyOn(playerRoomSpy, 'addBannedUsername').mockReturnThis();
        const playerSpy = jest.spyOn(playerRoomSpy, 'getPlayerByUsername').mockReturnValue(undefined);
        const deleteSpy = jest.spyOn(playerRoomSpy, 'deletePlayer').mockReturnThis();
        const sendSpy = jest.spyOn(gateway, 'sendPlayersData').mockReturnThis();
        gateway.banUsername(socket, MOCK_USER_INFO);
        expect(addBannedUsernameSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(playerSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith(socket, MOCK_USER_INFO.roomCode);
    });

    it('sendPlayersData() should check if the socket is in the right room and handle the data', () => {
        const spy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.sendPlayersData(socket, MOCK_ROOM_CODE);
        expect(spy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('sendPlayersData() should not handle the data if the socket is not in the right room', () => {
        const spy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        stub(socket, 'rooms').value(new Set([]));
        gateway.sendPlayersData(socket, MOCK_ROOM_CODE);
        expect(spy).not.toHaveBeenCalled();
    });

    it('startTimer() should start the timer', () => {
        matchRoomSpy.getMatchRoomByCode.returns(MOCK_MATCH_ROOM);
        matchBackupSpy.getBackupGame.returns(getMockGame());
        const timeMethodSpy = jest.spyOn(timeSpy, 'startTimer').mockReturnThis();
        gateway.startTimer(socket, MOCK_ROOM_CODE);
        expect(timeMethodSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should disconnect host and all other players and delete the match room if the host disconnects', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(MOCK_ROOM_CODE);
        const deleteSpy = jest.spyOn(matchRoomSpy, 'deleteMatchRoom').mockReturnThis();
        server.in.returns({
            disconnectSockets: () => {},
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleDisconnect(socket);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should disconnect the player and update list if a player disconnects', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(undefined);
        playerRoomSpy.deletePlayerBySocket.returns(MOCK_ROOM_CODE);
        const handleSpy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        gateway.handleDisconnect(socket);
        expect(handleSpy).toHaveBeenCalled();
    });

    it('handleSendPlayersData() should emit a fetch event to the match room with a list of stringified players', () => {
        const getSpy = jest.spyOn(playerRoomSpy, 'getPlayersStringified').mockReturnValue('mock');
        server.to.returns({
            emit: (event: string, playersStringified: string) => {
                expect(event).toEqual('fetchPlayersData');
                expect(playersStringified).toEqual('mock');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleSendPlayersData(MOCK_ROOM_CODE);
        expect(getSpy).toHaveBeenCalled();
    });
});

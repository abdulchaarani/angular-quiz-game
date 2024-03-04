import { Player } from '@app/model/schema/player.schema';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
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

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let matchSpy: SinonStubbedInstance<MatchBackupService>;
    let timeSpy: SinonStubbedInstance<TimeService>;
    let playerRoomSpy: SinonStubbedInstance<PlayerRoomService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        matchSpy = createStubInstance(MatchBackupService);
        timeSpy = createStubInstance(TimeService);
        playerRoomSpy = createStubInstance(PlayerRoomService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: MatchBackupService, useValue: matchSpy },
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

    it('joinRoom should let the player join if the room code and the username are valid', () => {
        matchRoomSpy.isValidMatchRoomCode.returns(true);
        playerRoomSpy.isValidUsername.returns(true);
        playerRoomSpy.addPlayer.returns(MOCK_PLAYER);
        const result = gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeTruthy();
        expect(playerRoomSpy.addPlayer.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_USER_INFO.roomCode, username: MOCK_PLAYER.username });
    });

    it('joinRoom should not let the player join if the room code or the username are invalid', () => {
        matchRoomSpy.isValidMatchRoomCode.returns(false);
        playerRoomSpy.isValidUsername.returns(false);
        server.in.returns({
            disconnectSockets: () => {},
        } as BroadcastOperator<unknown, unknown>);

        gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeFalsy();
    });
});

import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let matchSpy: SinonStubbedInstance<MatchBackupService>;
    let timeSpy: SinonStubbedInstance<TimeService>;
    let playerRoomSpy: SinonStubbedInstance<PlayerRoomService>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        matchSpy = createStubInstance(MatchBackupService);
        timeSpy = createStubInstance(TimeService);
        playerRoomSpy = createStubInstance(PlayerRoomService);
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
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});

import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { TimeService } from '@app/services/time/time.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let matchSpy: SinonStubbedInstance<MatchService>;
    let timeSpy: SinonStubbedInstance<TimeService>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        matchSpy = createStubInstance(MatchService);
        timeSpy = createStubInstance(TimeService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: MatchService, useValue: matchSpy },
                { provide: TimeService, useValue: timeSpy },
            ],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});

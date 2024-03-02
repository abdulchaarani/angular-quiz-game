import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchGateway } from './match.gateway';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;

    beforeEach(async () => {
        matchRoomSpy = createStubInstance(MatchRoomService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchGateway, { provide: MatchRoomService, useValue: matchRoomSpy }],
        }).compile();

        gateway = module.get<MatchGateway>(MatchGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});

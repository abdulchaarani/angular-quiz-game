import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchRoomService } from '../match-room/match-room.service';
import { PlayerRoomService } from './player-room.service';

describe('PlayerRoomService', () => {
    let service: PlayerRoomService;
    let matchRoomService: SinonStubbedInstance<MatchRoomService>;

    beforeEach(async () => {
        matchRoomService = createStubInstance(MatchRoomService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [PlayerRoomService, { provide: MatchRoomService, useValue: matchRoomService }],
        }).compile();

        service = module.get<PlayerRoomService>(PlayerRoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

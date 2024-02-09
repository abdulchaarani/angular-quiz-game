import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance } from 'sinon';

describe('MatchService', () => {
    let service: MatchService;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService, { provide: GameService, useValue: gameService }],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

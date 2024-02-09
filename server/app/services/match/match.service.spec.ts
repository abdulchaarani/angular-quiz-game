import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance } from 'sinon';
import { GameService } from '../game/game.service';
import { MatchService } from './match.service';

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

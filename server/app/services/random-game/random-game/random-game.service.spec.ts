import { Test, TestingModule } from '@nestjs/testing';
import { RandomGameService } from './random-game.service';

describe('RandomGameService', () => {
    let service: RandomGameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RandomGameService],
        }).compile();

        service = module.get<RandomGameService>(RandomGameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

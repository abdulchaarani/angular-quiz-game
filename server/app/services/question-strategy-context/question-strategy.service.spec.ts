import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStrategyContext } from './question-strategy.service';

describe('QuestionStrategyService', () => {
    let service: QuestionStrategyContext;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [QuestionStrategyContext],
        }).compile();

        service = module.get<QuestionStrategyContext>(QuestionStrategyContext);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});

import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStrategyService } from './question-strategy.service';

describe('QuestionStrategyService', () => {
  let service: QuestionStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionStrategyService],
    }).compile();

    service = module.get<QuestionStrategyService>(QuestionStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

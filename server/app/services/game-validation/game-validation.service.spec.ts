import { Test, TestingModule } from '@nestjs/testing';
import { GameValidationService } from './game-validation.service';

describe('GameValidationService', () => {
  let service: GameValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameValidationService],
    }).compile();

    service = module.get<GameValidationService>(GameValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HistogramService } from './histogram.service';

describe('HistogramService', () => {
  let service: HistogramService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistogramService],
    }).compile();

    service = module.get<HistogramService>(HistogramService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

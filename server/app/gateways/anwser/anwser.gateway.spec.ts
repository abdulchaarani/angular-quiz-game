import { Test, TestingModule } from '@nestjs/testing';
import { AnwserGateway } from './anwser.gateway';

describe('AnwserGateway', () => {
  let gateway: AnwserGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnwserGateway],
    }).compile();

    gateway = module.get<AnwserGateway>(AnwserGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

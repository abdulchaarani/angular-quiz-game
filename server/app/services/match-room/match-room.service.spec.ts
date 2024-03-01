import { Test, TestingModule } from '@nestjs/testing';
import { MatchRoomService } from './match-room.service';

describe('MatchRoomService', () => {
  let service: MatchRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchRoomService],
    }).compile();

    service = module.get<MatchRoomService>(MatchRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

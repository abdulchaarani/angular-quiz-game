import { TestBed } from '@angular/core/testing';

import { RandomGameService } from './random-game.service';

describe('RandomGameService', () => {
  let service: RandomGameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

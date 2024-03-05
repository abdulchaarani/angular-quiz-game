import { TestBed } from '@angular/core/testing';

import { QuizManagerService } from './quiz-manager.service';

describe('QuizManagerService', () => {
  let service: QuizManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

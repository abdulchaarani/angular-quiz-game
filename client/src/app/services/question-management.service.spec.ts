import { TestBed } from '@angular/core/testing';

import { QuestionManagementService } from './question-management.service';

describe('QuestionManagementService', () => {
  let service: QuestionManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

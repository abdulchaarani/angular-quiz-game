import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { matchLoginGuard } from './match-login.guard';

describe('matchLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => matchLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

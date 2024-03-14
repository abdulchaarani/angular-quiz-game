import { TestBed } from '@angular/core/testing';

import { VirtualHostService } from './virtual-host.service';

describe('VirtualHostService', () => {
  let service: VirtualHostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualHostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

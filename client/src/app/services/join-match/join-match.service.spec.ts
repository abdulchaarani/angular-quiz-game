import { TestBed } from '@angular/core/testing';

import { JoinMatchService } from './join-match.service';

describe('JoinMatchService', () => {
    let service: JoinMatchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(JoinMatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

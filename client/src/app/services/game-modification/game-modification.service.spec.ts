import { TestBed } from '@angular/core/testing';

import { GameModificationService } from './game-modification.service';

describe('GameModificationService', () => {
    let service: GameModificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameModificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

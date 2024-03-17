import { TestBed } from '@angular/core/testing';

import { QuestionContextService } from './question-context.service';

describe('QuestionContextService', () => {
    let service: QuestionContextService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuestionContextService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

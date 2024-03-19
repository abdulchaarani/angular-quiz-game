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

    it('should set context', () => {
        service.setContext('testPage');
        expect(service['context']).toBe('testPage');
    });

    it('should get context', () => {
        service.setContext('testPage');
        const context = service.getContext();
        expect(context).toBe('testPage');
    });
});

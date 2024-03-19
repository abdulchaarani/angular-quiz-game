import { TestBed } from '@angular/core/testing';

import { QuestionContextService } from './question-context.service';
import { MatchContext } from '@app/constants/states';

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
        service.setContext(MatchContext.TestPage);
        expect(service['context']).toBe(MatchContext.TestPage);
    });

    it('should get context', () => {
        service.setContext(MatchContext.TestPage);
        const context = service.getContext();
        expect(context).toBe(MatchContext.TestPage);
    });
});

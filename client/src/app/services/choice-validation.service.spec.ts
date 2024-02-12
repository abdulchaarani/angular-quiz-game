import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ChoiceValidationService } from './choice-validation.service';

describe('ChoiceValidationService', () => {
    let service: ChoiceValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ChoiceValidationService],
        });
        service = TestBed.inject(ChoiceValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate choices successfully', () => {
        const choices = { selected: ['yes', 'no'] };
        const spy = spyOn(service, 'add').and.callThrough();
        service.validateChoices(choices, '0', '007');
        expect(spy).toHaveBeenCalledOnceWith(choices, '0/questions/007/validate-choice');
    });
});

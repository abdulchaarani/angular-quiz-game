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

    it('should ');
});

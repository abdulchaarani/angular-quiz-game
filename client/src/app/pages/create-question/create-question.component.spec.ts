import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateQuestionComponent } from './create-question.component';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent],
            providers: [MatSnackBar]
        });
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

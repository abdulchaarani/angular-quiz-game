import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAreaComponent } from './question-area.component';

describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent],
        });
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

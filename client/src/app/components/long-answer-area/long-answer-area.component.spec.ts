import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LongAnswerAreaComponent } from './long-answer-area.component';

describe('FreeAnswerAreaComponent', () => {
    let component: LongAnswerAreaComponent;
    let fixture: ComponentFixture<LongAnswerAreaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LongAnswerAreaComponent],
        });
        fixture = TestBed.createComponent(LongAnswerAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

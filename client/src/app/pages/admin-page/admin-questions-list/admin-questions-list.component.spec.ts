import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionsListComponent } from './admin-questions-list.component';

describe('AdminQuestionsListComponent', () => {
    let component: AdminQuestionsListComponent;
    let fixture: ComponentFixture<AdminQuestionsListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdminQuestionsListComponent],
        });
        fixture = TestBed.createComponent(AdminQuestionsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

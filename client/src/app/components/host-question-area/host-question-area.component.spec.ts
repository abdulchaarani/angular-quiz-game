import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HostQuestionAreaComponent } from './host-question-area.component';
import { ChatComponent } from '../chat/chat.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component } from '@angular/core';

describe('HostQuestionAreaComponent', () => {
    let component: HostQuestionAreaComponent;
    let fixture: ComponentFixture<HostQuestionAreaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                HostQuestionAreaComponent,
                ChatComponent,
                MockAppPlayersListComponent,
                MockAppHistogramComponent,
                MockMatFormFieldComponent,
                MockMatLabelComponent,
                MockMatIconComponent
            ],
            imports: [MatProgressSpinnerModule],
        }).compileComponents();
        fixture = TestBed.createComponent(HostQuestionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    @Component({
        selector: 'app-players-list',
        template: '',
    })
    class MockAppPlayersListComponent {}

    @Component({
        selector: 'app-histogram',
        template: '',
    })
    class MockAppHistogramComponent {}

    @Component({
        selector: 'mat-form-field',
        template: '',
    })
    class MockMatFormFieldComponent {}

    @Component({
        selector: 'mat-label',
        template: '',
    })
    class MockMatLabelComponent {}

    @Component({
        selector: 'mat-icon',
        template: '',
    })
    class MockMatIconComponent {}

    

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

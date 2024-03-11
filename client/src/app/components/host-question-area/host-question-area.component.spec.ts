import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostQuestionAreaComponent } from './host-question-area.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Component } from '@angular/core';

describe('HostQuestionAreaComponent', () => {
    let component: HostQuestionAreaComponent;
    let fixture: ComponentFixture<HostQuestionAreaComponent>;

    @Component({
        selector: 'app-chat',
        template: '',
    })
    class MockChatComponent {}


@Component({
    selector: 'app-histogram',
    template: '',
})

class MockAppHistogramComponent {}

@Component({
    selector: 'app-players-list',
    template: '',
})
class MockAppPlayersListComponent {}

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostQuestionAreaComponent, MockChatComponent, MockAppHistogramComponent, MockAppPlayersListComponent ],
            imports: [MatProgressSpinnerModule],
        });
        fixture = TestBed.createComponent(HostQuestionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

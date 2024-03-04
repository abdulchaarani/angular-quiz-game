import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostQuestionAreaComponent } from './host-question-area.component';
import { ChatComponent } from '../chat/chat.component';
//import { PlayersListComponent } from '../players-list/players-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
//import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing'; 

describe('HostQuestionAreaComponent', () => {
    let component: HostQuestionAreaComponent;
    let fixture: ComponentFixture<HostQuestionAreaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostQuestionAreaComponent, 
                ChatComponent,
               // PlayersListComponent
            ],
            imports: [MatProgressSpinnerModule],
        }).compileComponents();
        fixture = TestBed.createComponent(HostQuestionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

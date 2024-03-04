import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';
import { WaitPageComponent } from './wait-page.component';
import SpyObj = jasmine.SpyObj;
describe('WaitPageComponent', () => {
    let component: WaitPageComponent;
    let fixture: ComponentFixture<WaitPageComponent>;

    let matchRoomSpy: SpyObj<MatchRoomService>;
    let timeSpy: SpyObj<TimeService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername', 'banUsername']);
        timeSpy = jasmine.createSpyObj('TimeService', ['']); // TODO: Add methods
        TestBed.configureTestingModule({
            declarations: [WaitPageComponent],
            providers: [
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: TimeService, useValue: timeSpy },
            ],
        });
        fixture = TestBed.createComponent(WaitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { TimeService } from '@app/services/time/time.service';
import { WaitPageComponent } from './wait-page.component';
import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-chat',
    template: '',
})
class MockChatComponent {}

describe('WaitPageComponent', () => {
    let component: WaitPageComponent;
    let fixture: ComponentFixture<WaitPageComponent>;

    let matchRoomSpy: SpyObj<MatchRoomService>;
    let timeSpy: SpyObj<TimeService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername', 'banUsername', 'toggleLock']);
        timeSpy = jasmine.createSpyObj('TimeService', ['']); // TODO: Add methods
        TestBed.configureTestingModule({
            declarations: [WaitPageComponent, MockChatComponent],
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

    it('time() should return the time of the timeService', () => {
        const time = 100;
        (component.timeService as unknown).time = time;
        expect(component.time).toEqual(time);
    });

    it('isHost() should be true if username is "Organisateur", else false', () => {
        const cases = [
            { username: '', expectedResult: false },
            { username: 'Organisateur', expectedResult: true },
        ];
        for (const { username, expectedResult } of cases) {
            matchRoomSpy.getUsername.and.returnValue(username);
            const result = component.isHost;
            expect(matchRoomSpy.getUsername).toHaveBeenCalled();
            expect(result).toBe(expectedResult);
        }
    });

    it('toggleLock() should call toggleLock of matchRoomService', () => {
        component.toggleLock();
        expect(matchRoomSpy.toggleLock).toHaveBeenCalled();
    });

    it('banPlayerUsername() should call banUsername from matchRoomService', () => {
        component.banPlayerUsername('');
        expect(matchRoomSpy.banUsername).toHaveBeenCalled();
    });

    it('startMatch() should set startTimerButton to true and start the timer', () => {
        const spy = spyOn(component, 'startTimer');
        component.startMatch();
        expect(component.startTimerButton).toBeTrue();
        expect(spy).toHaveBeenCalled();
    });

    // TODO: Start Timer + get Time + compute Timer Progress
});

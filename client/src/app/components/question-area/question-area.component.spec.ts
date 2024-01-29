import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { TimeService } from '@app/services/time.service';
import { QuestionAreaComponent } from './question-area.component';
import SpyObj = jasmine.SpyObj;

describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;
    let timeServiceSpy: SpyObj<TimeService>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['startTimer', 'stopTimer', 'time']);
        TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent],
            providers: [{ provide: TimeService, useValue: timeServiceSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO : Make this more clear
    it('timer should start', fakeAsync(() => {
        expect(timeServiceSpy.startTimer).toHaveBeenCalled();
        expect(timeServiceSpy.startTimer).toHaveBeenCalledWith(component['timeLimit']);
    }));

    // TODO : figure this out...
    it('computeTimerProgress should return a percentage of time', () => {
        const expectedResult = 100;
        const spy = spyOn(component, 'computeTimerProgress').and.callThrough();
        const result = component.computeTimerProgress();
        expect(result).toBeCloseTo(expectedResult);
        expect(spy).toHaveBeenCalled();
    });
});

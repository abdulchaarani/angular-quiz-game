import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Router } from '@angular/router';
import { QuestionAreaComponent } from './question-area.component';

// import SpyObj = jasmine.SpyObj;

describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;
    let router: Router;
    // let timeServiceSpy: SpyObj<TimeService>;

    beforeEach(async () => {
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TODO : Make this more clear
    it('timer should start', fakeAsync(() => {
        const spy = spyOn(component.timeService, 'startTimer');
        component.ngOnInit();
        tick();

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(component['gameDuration']);
    }));

    it('Navigate to game list page when timer runs out', fakeAsync(() => {
        component.gameDuration = 3;
        tick(3001); // TODO : remove 'magic' number
        // TODO : Change to game list page when it exists
        expect(router.url).toBe('/');
    }));
});

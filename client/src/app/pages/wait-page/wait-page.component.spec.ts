import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitPageComponent } from './wait-page.component';

describe('WaitPageComponent', () => {
    let component: WaitPageComponent;
    let fixture: ComponentFixture<WaitPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitPageComponent],
        });
        fixture = TestBed.createComponent(WaitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitPageComponent } from './wait-page.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChatComponent } from '@app/components/chat/chat.component';

describe('WaitPageComponent', () => {
    let component: WaitPageComponent;
    let fixture: ComponentFixture<WaitPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WaitPageComponent, ChatComponent ],
            imports:[MatIconModule, MatSlideToggleModule, MatCardModule, FormsModule,  MatProgressSpinnerModule],
        });
        fixture = TestBed.createComponent(WaitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

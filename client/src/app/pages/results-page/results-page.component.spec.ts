import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsPageComponent } from './results-page.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsPageComponent, ChatComponent, HistogramComponent],
            imports: [MatPaginatorModule, MatButtonModule, FormsModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

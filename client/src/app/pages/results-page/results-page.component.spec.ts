import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsPageComponent } from './results-page.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '@app/components/chat/chat.component';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { Component } from '@angular/core';


@Component({
    selector: 'app-players-list',
    template: '',
})
class MockAppPlayersListComponent {}

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

@Component({
    selector: 'mat-form-field',
    template: '',
})
class MockMatFormFieldComponent {}

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ResultsPageComponent, 
                ChatComponent, 
                HistogramComponent,
                MockAppPlayersListComponent, 
                MockMatIconComponent,
                MockMatLabelComponent,
                MockMatFormFieldComponent],
            imports: [MatPaginatorModule, MatButtonModule, FormsModule, AgChartsAngularModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

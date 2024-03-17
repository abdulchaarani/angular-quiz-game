// Mock classes are required to avoid errors during tests
// eslint-disable max-classes-per-file
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HistogramComponent } from '@app/components/histogram/histogram.component';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { ResultsPageComponent } from './results-page.component';

@Component({
    // Component is provided by Angular Material; therefore, its selector starts with mat
    // eslint-disable component-selector
    selector: 'mat-label',
    template: '',
})
class MockMatLabelComponent {}

@Component({
    // Component is provided by Angular Material; therefore, its selector starts with mat
    // eslint-disable component-selector
    selector: 'mat-icon',
    template: '',
})
class MockMatIconComponent {}

@Component({
    selector: 'app-chat',
    template: '',
})
class MockChatComponent {}

@Component({
    selector: 'app-players-list',
    template: '',
})
class MockPlayersListComponent {}

@Component({
    // Component is provided by Angular Material; therefore, its selector starts with mat
    // eslint-disable component-selector
    selector: 'mat-form-field',
    template: '',
})
class MockMatFormFieldComponent {}

// @Component({
//     selector: 'app-histogram',
//     template: '',
// })
// class MockAppHistogramComponent {}

xdescribe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResultsPageComponent,
                HistogramComponent,
                MockMatIconComponent,
                MockMatLabelComponent,
                MockMatFormFieldComponent,
                MockChatComponent,
                MockPlayersListComponent,
            ],
            imports: [MatPaginatorModule, FormsModule, AgChartsAngularModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

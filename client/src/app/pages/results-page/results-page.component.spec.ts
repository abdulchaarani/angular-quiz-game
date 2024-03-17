// Mock classes are required to avoid errors during tests
/* eslint-disable max-classes-per-file */
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Player } from '@app/interfaces/player';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChoiceTally } from '@common/interfaces/choice-tally';
import { Histogram } from '@common/interfaces/histogram';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { ResultsPageComponent } from './results-page.component';

@Component({
    // Component is provided by Angular Material; therefore, its selector starts with mat
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'mat-label',
    template: '',
})
class MockMatLabelComponent {}

@Component({
    // Angular Material Mock: Provided selector does not start by app
    // eslint-disable-next-line @angular-eslint/component-selector
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
class MockPlayersListComponent {
    @Input() players: Player[];
}

@Component({
    // Angular Material Mock: Provided selector does not start by app
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'mat-form-field',
    template: '',
})
class MockMatFormFieldComponent {}

@Component({
    selector: 'app-histogram',
    template: '',
})
class MockHistogramComponent {
    @Input() isResultsPage: boolean = false;
    @Input() currentHistogram: Histogram = {} as Histogram;
    currentQuestion: string;
    chartOptions: AgChartOptions = {};
    choiceTally: ChoiceTally[] = [];
    histogramsGame: Histogram[] = [];
}

describe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let matchRoomServiceSpy: jasmine.SpyObj<MatchRoomService>;
    let histogramServiceSpy: jasmine.SpyObj<HistogramService>;

    beforeEach(() => {
        matchRoomServiceSpy = jasmine.createSpyObj('MatchRoomService', ['disconnect']);
        histogramServiceSpy = jasmine.createSpyObj('HistogramService', ['histogramHistory']);
        TestBed.configureTestingModule({
            declarations: [
                ResultsPageComponent,
                MockMatIconComponent,
                MockMatLabelComponent,
                MockMatFormFieldComponent,
                MockChatComponent,
                MockPlayersListComponent,
                MockHistogramComponent,
            ],
            providers: [
                { provide: MatchRoomService, useValue: matchRoomServiceSpy },
                { provide: HistogramService, useValue: histogramServiceSpy },
            ],
            imports: [MatPaginatorModule, FormsModule, AgChartsAngularModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;
        spyOn(component, 'initializeHistograms').and.callFake(() => {});
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe from subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpyObj('unsubscribe', ['unsubscribe']);
        const subscriptions = [unsubscribeSpy, unsubscribeSpy, unsubscribeSpy];
        component['subscriptions'] = subscriptions;
    
        component.ngOnDestroy();
    
        expect(unsubscribeSpy.unsubscribe).toHaveBeenCalledTimes(subscriptions.length);
        expect(component['subscriptions']).toEqual([]);
    });

    it('should handle page event', () => {
        const pageEvent = { pageIndex: 1 } as any;
        component.handlePageEvent(pageEvent);
        expect(component.pageEvent).toEqual(pageEvent);
        expect(component.currentQuestionIndex).toEqual(pageEvent.pageIndex);
    });

    it('should call matchRoomService.disconnect on handleDisconnect', () => {
        component.handleDisconnect();
        expect(matchRoomServiceSpy.disconnect).toHaveBeenCalled();
    });

});

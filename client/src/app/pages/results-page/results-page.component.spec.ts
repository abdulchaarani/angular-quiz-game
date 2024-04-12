/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Subject, Subscription } from 'rxjs';
import { ConfettiService } from '@app/services/confetti/confetti.service';

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

xdescribe('ResultsPageComponent', () => {
    let component: ResultsPageComponent;
    let fixture: ComponentFixture<ResultsPageComponent>;
    let matchRoomServiceSpy: jasmine.SpyObj<MatchRoomService>;
    let histogramServiceSpy: jasmine.SpyObj<HistogramService>;
    let confettiServiceSpy: jasmine.SpyObj<ConfettiService>;
    let histogramSubject: Subject<Histogram[]>;

    beforeEach(() => {
        matchRoomServiceSpy = jasmine.createSpyObj('MatchRoomService', ['disconnect', 'gameOver']);
        histogramServiceSpy = jasmine.createSpyObj('HistogramService', ['onHistogramHistory']);
        confettiServiceSpy = jasmine.createSpyObj('ConfettiService', ['onWinner']);
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
                { provide: ConfettiService, useValue: confettiServiceSpy },
            ],
            imports: [MatPaginatorModule, FormsModule, AgChartsAngularModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
        fixture = TestBed.createComponent(ResultsPageComponent);
        component = fixture.componentInstance;

        histogramSubject = new Subject<Histogram[]>();
        histogramServiceSpy.histogramHistory$ = histogramSubject.asObservable();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should unsubscribe from subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpyObj('unsubscribe', ['unsubscribe']);
        const subscriptions = [unsubscribeSpy, unsubscribeSpy, unsubscribeSpy];
        component['histogramSubscriptions'] = subscriptions;

        component.ngOnDestroy();

        expect(unsubscribeSpy.unsubscribe).toHaveBeenCalledTimes(subscriptions.length);
        expect(component['histogramSubscriptions']).toEqual([]);
    });

    it('should handle page event', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageEvent = { pageIndex: 1 } as any;
        component.handlePageEvent(pageEvent);
        expect(component.pageEvent).toEqual(pageEvent);
        expect(component.currentQuestionIndex).toEqual(pageEvent.pageIndex);
    });

    it('should call matchRoomService.disconnect on handleDisconnect', () => {
        component.handleDisconnect();
        expect(matchRoomServiceSpy.disconnect).toHaveBeenCalled();
    });

    it('subscribeToHistogramHistory() should add a subscription to histogram history and respond when history changes ', () => {
        const mockHistogramHistory = [] as Histogram[];
        const subscriptions: Subscription[] = (component['histogramSubscriptions'] = []);
        component['subscribeToHistogramHistory']();
        expect(subscriptions.length).toEqual(1);
        histogramSubject.next(mockHistogramHistory);
        expect(component.histogramsGame).toEqual(mockHistogramHistory);
    });
});

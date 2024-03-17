import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { ResultsPageComponent } from './results-page.component';

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
    selector: 'mat-form-field',
    template: '',
})
class MockMatFormFieldComponent {}

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

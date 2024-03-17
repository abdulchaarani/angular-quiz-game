import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { HistogramComponent } from './histogram.component';

fdescribe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;
    let histogramServiceSpy: jasmine.SpyObj<HistogramService>;

    beforeEach(() => {
        histogramServiceSpy = jasmine.createSpyObj('HistogramService', ['currentHistogram']);
        TestBed.configureTestingModule({
            declarations: [HistogramComponent],
            imports: [AgChartsAngularModule],
            providers: [{ provide: HistogramService, useValue: histogramServiceSpy }],
        });

        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        spyOn<any>(component, 'subscribeToChoiceTally').and.callFake(() => {
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initalize correctly if it is in results page', () => {
        component.isResultsPage = true;
        component.currentHistogram = {
            question: 'question',
            choiceTallies: []
        };
        component.ngOnInit();
        expect(component.choiceTally).toEqual(component.currentHistogram.choiceTallies);
    });

    it ('should reset chart and initialize on changes if currentQuestion changes', () => {
        const changes = {
            currentQuestion: {
                currentValue: 'new question',
                previousValue: 'old question',
                firstChange: true,
                isFirstChange: () => true
            },
        };
        spyOn(component, 'resetChart');
        spyOn(component, 'ngOnInit');
    
        component.ngOnChanges(changes);
    
        expect(component.resetChart).toHaveBeenCalled();
        expect(component.ngOnInit).toHaveBeenCalled();
    });

    it ('should reset chart and initialize on changes if currentHistogram changes', () => {
        const changes = {
            currentHistogram: {
                currentValue: {
                    question: 'new question',
                    choiceTallies: []
                },
                previousValue: {
                    question: 'old question',
                    choiceTallies: []
                },
                firstChange: true,
                isFirstChange: () => true
            }
        };
        spyOn(component, 'resetChart');
        spyOn(component, 'ngOnInit');
    
        component.ngOnChanges(changes);
    
        expect(component.resetChart).toHaveBeenCalled();
        expect(component.ngOnInit).toHaveBeenCalled();
    });

    it('should unsubscribe from subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpyObj('unsubscribe', ['unsubscribe']);
        const subscriptions = [unsubscribeSpy, unsubscribeSpy, unsubscribeSpy];
        component['subscriptions'] = subscriptions;
    
        component.ngOnDestroy();
    
        expect(unsubscribeSpy.unsubscribe).toHaveBeenCalledTimes(subscriptions.length);
    });

    it('should reset chart', () => {
        component.resetChart();
        expect(component.chartOptions).toEqual({});
        expect(component.choiceTally).toEqual([]);
    });

    it('should set up data', () => {
        component.choiceTally = [
            {
                text: 'text',
                isCorrect: true,
                tally: 1
            },
            {
                text: 'text',
                isCorrect: false,
                tally: 1
            }
        ];
        const data = component.setUpData();
        expect(data).toEqual([
            {
                label: 'C1 ✅',
                text: 'text',
                picks: 1
            },
            {
                label: 'C2 ❌',
                text: 'text',
                picks: 1
            }
        ]);
    });

});

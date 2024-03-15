import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { ChoiceTally } from '@common/interfaces/choice-tally';
import { AgChartOptions } from 'ag-charts-community';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isResultsPage: boolean = false;
    currentQuestion: string;
    chartOptions: AgChartOptions = {};
    choiceTally: ChoiceTally[] = [];
    private subscriptions: Subscription[] = [];

    constructor(private readonly histogramService: HistogramService) {}

    ngOnInit(): void {
        if (!this.isResultsPage) {
            this.histogramService.currentHistogram();
            this.subscriptions.push(
                this.histogramService.choiceTally$.subscribe((data) => {
                    this.currentQuestion = data.question;
                    this.choiceTally = data.choiceTallies;
                    const dataTally = this.setUpData();
                    this.setupChart(dataTally);
                }),
            );
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.isResultsPage) {
            this.resetChart();
            this.ngOnInit();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    resetChart(): void {
        this.chartOptions = {};
        this.choiceTally = [];
    }

    setUpData() {
        return this.choiceTally.map((element, index) => ({
            label: `C${index + 1} ${element.isCorrect ? '✅' : '❌'}`,
            text: element.text,
            picks: element.tally,
        }));
    }

    private setupChart(data: any): void {
        this.chartOptions = {
            title: { text: this.currentQuestion },
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                    title: { text: 'Choix de réponse' },
                },
                {
                    type: 'number',
                    position: 'left',
                    title: { text: 'Nombre de sélections' },
                },
            ],
            data,
            series: [
                {
                    type: 'bar',
                    xKey: 'label',
                    xName: 'Choix de réponse',
                    yKey: 'picks',
                    yName: 'Nombre de choix',
                    tooltip: {
                        enabled: true,
                        renderer: (params: any) => {
                            return {
                                content: `Choice: ${params.datum.text} <br/> Selections: ${params.datum.picks}`,
                            };
                        },
                    },
                    formatter: (params: any) => {
                        const fill = params.datum[params.xKey].includes('✅') ? 'green' : 'red';
                        return { fill };
                    },
                },
            ],
        };
    }
}

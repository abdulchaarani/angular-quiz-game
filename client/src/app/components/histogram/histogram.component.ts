import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { ChoiceTally } from '@common/interfaces/choice-tally';
import { Histogram } from '@common/interfaces/histogram';
import { AgChartOptions } from 'ag-charts-community';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isResultsPage: boolean = false;
    @Input() currentHistogram: Histogram = {} as Histogram;
    currentQuestion: string;
    chartOptions: AgChartOptions = {};
    choiceTally: ChoiceTally[] = [];
    histogramsGame: Histogram[] = [];
    private subscriptions: Subscription[] = [];

    constructor(private readonly histogramService: HistogramService) {}
    subscribeToChoiceTally() {
        this.subscriptions.push(
            this.histogramService.currentHistogram$.subscribe((data: { question: string; choiceTallies: ChoiceTally[] }) => {
                this.currentQuestion = data.question;
                this.choiceTally = data.choiceTallies;
                const dataTally = this.setUpData();
                this.setupChart(dataTally);
            }),
        );
    }

    ngOnInit(): void {
        if (!this.isResultsPage) {
            this.histogramService.onCurrentHistogram();
            this.subscribeToChoiceTally();
        } else {
            this.choiceTally = this.currentHistogram.choiceTallies;
            this.currentQuestion = this.currentHistogram.question;
            const dataTally = this.setUpData();
            this.setupChart(dataTally);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion || changes.currentHistogram) {
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

    // AG Charts requires using any; using unknown will cause compilation errors
    /* eslint-disable @typescript-eslint/no-explicit-any */

    renderChart(params: any) {
        return {
            content: `Choix: ${params.datum.text} <br/> Sélections: ${params.datum.picks}`,
        };
    }

    formatChart(params: any) {
        const fill = params.datum[params.xKey].includes('✅') ? 'green' : 'red';
        return { fill };
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
                        renderer: this.renderChart.bind(this),
                    },
                    formatter: this.formatChart.bind(this),
                },
            ],
        };
    }
}

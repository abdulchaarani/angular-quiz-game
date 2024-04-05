import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { GradeTally } from '@common/interfaces/choice-tally';
import { GradesHistogram, Histogram, PlayerCountHistogram } from '@common/interfaces/histogram';
import { AgChartOptions } from 'ag-charts-community';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-long-answer-histogram',
    templateUrl: './long-answer-histogram.component.html',
    styleUrls: ['./long-answer-histogram.component.scss'],
})
export class LongAnswerHistogramComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isResultsPage: boolean = false;
    @Input() currentLongAnswerHistogram: GradesHistogram = {} as GradesHistogram;
    currentQuestion: string;
    chartOptions: AgChartOptions = {};
    gradeTally: GradeTally[] = [];
    activePlayers: number;
    inactivePlayers: number;
    private histogramSubscriptions: Subscription[] = [];

    constructor(private readonly histogramService: HistogramService) {}

    subscribeToCurrentHistogram() {
        const currentHistogramSubscription = this.histogramService.currentHistogram$.subscribe((data: Histogram) => {
            const longAnswerData = data as PlayerCountHistogram;
            this.currentQuestion = longAnswerData.question;
            this.activePlayers = longAnswerData.activePlayers;
            this.inactivePlayers = longAnswerData.inactivePlayers;
            const dataTally = this.setUpData();
            this.setupChart(dataTally);
        });
        this.histogramSubscriptions.push(currentHistogramSubscription);
    }

    ngOnInit(): void {
        if (!this.isResultsPage) {
            this.histogramService.onCurrentHistogram();
            this.subscribeToCurrentHistogram();
        } else {
            this.gradeTally = this.currentLongAnswerHistogram.gradeTallies;
            this.currentQuestion = this.currentLongAnswerHistogram.question;
            const dataTally = this.setUpResultsPageData();
            this.setupResultsPageChart(dataTally);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion || changes.currentHistogram) {
            this.resetChart();
            this.ngOnInit();
        }
    }

    ngOnDestroy(): void {
        this.histogramSubscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    resetChart(): void {
        this.chartOptions = {};
        this.gradeTally = [];
    }

    setUpData() {
        return [
            {
                grade: 'Actif',
                count: this.activePlayers,
            },
            {
                grade: 'Inactif',
                count: this.inactivePlayers,
            },
        ];
    }

    setUpResultsPageData() {
        return this.gradeTally.map((tally) => {
            return {
                grade: tally.score,
                count: tally.tally,
            };
        });
    }

    // AG Charts requires using any; using unknown will cause compilation errors
    /* eslint-disable @typescript-eslint/no-explicit-any */

    private renderChart(params: any) {
        return {
            content: `Note: ${params.datum.grade}\nNombre: ${params.datum.count}`,
        };
    }

    private formatChart(params: any) {
        let fill;
        switch (params.datum.grade) {
            case '100': {
                fill = 'green';

                break;
            }
            case '50': {
                fill = 'yellow';

                break;
            }
            case '0': {
                fill = 'red';

                break;
            }
        }
        return { fill };
    }

    private setupChart(data: any): void {
        this.chartOptions = {
            title: { text: this.currentQuestion },
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                },
                {
                    type: 'number',
                    position: 'left',
                    title: { text: 'Nombre de joueurs' },
                },
            ],
            data,
            series: [
                {
                    type: 'bar',
                    xKey: 'grade',
                    yKey: 'count',
                    yName: 'Nombre de joueurs',
                },
            ],
        };
    }

    private setupResultsPageChart(data: any): void {
        this.chartOptions = {
            title: { text: this.currentQuestion },
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                    title: { text: 'Note sur 100' },
                },
                {
                    type: 'number',
                    position: 'left',
                    title: { text: 'Nombre de joueurs' },
                },
            ],
            data,
            series: [
                {
                    type: 'bar',
                    xKey: 'grade',
                    xName: 'Note sur 100',
                    yKey: 'count',
                    yName: 'Nombre de joueurs',
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
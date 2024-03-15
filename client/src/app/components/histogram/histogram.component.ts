import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
// import { Choice } from '@app/interfaces/choice';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { ChoiceTally } from '@common/interfaces/choice-tally';
// import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges, OnDestroy {
    currentQuestion: string;
    chartOptions: AgChartOptions = {};
    choiceTally: ChoiceTally[] = [];
    private subscriptions: Subscription[] = [];
    private colors: string[] = [];

    constructor(private readonly histogramService: HistogramService) {}

    ngOnInit(): void {
        this.histogramService.currentHistogram();
        this.subscriptions.push(
            this.histogramService.choiceTally$.subscribe((data) => {
                this.currentQuestion = data.question;
                this.choiceTally = data.choiceTallies;
                if (this.colors.length === 0) this.colors = this.choiceTally.map(() => this.getRandomColor());
                const dataTally = this.setUpData();
                console.log(dataTally);
                this.setupChart(dataTally);
            }),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
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
        this.colors = [];
    }

    setUpData() {
        return this.choiceTally.map((element, index) => ({
            label: `C${index + 1} ${element.isCorrect ? '✅' : '❌'}`,
            text: element.text,
            picks: element.tally,
            color: this.colors[index],
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

    private getRandomColor(): string {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

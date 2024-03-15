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
    numberOfPicks: number;
    choiceTally: ChoiceTally[] = [];
    private subscriptions: Subscription[] = [];

    constructor(
        private readonly histogramService: HistogramService, // private matchRoomService: MatchRoomService,
    ) {}

    ngOnInit(): void {
        this.histogramService.setUpHistogram();
        this.histogramService.currentHistogram();
        this.subscriptions.push(
            this.histogramService.choiceTally$.subscribe((data) => {
                this.currentQuestion = data.question;
                this.choiceTally = data.choiceTallies;
                let dataTally = this.setUpData();
                this.setupChart(dataTally);
            }),
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;
            this.resetChart();
            this.ngOnInit();
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];
    }

    resetChart(): void {
        this.chartOptions = {};
        this.choiceTally = [];
    }

    setUpData() {
        const data = [];

        for (const element of this.choiceTally) {
            let textToShow: string = element.text;
            if (element.isCorrect) {
                textToShow = `${textToShow} (Correct)`;
            } else {
                textToShow = `${textToShow} (Incorrect)`;
            }
            data.push({ text: textToShow, picks: element.tally });
        }

        return data;
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
                    xKey: 'text',
                    xName: 'Choix de réponse',
                    yKey: 'picks',
                    yName: 'Nombre de choix',
                    formatter: (params) => {
                        let fill;
                        if (params.datum[params.xKey].includes('Correct')) {
                            fill = 'green';
                        } else {
                            fill = 'red';
                        }
                        return { fill };
                    },
                },
            ],
        };
    }
}

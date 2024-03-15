import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
// import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { ChoiceTally } from '@common/interfaces/choice-tally';
// import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnInit, OnChanges {
    // TODO : Fix later
    @Input() currentQuestion: Question;
    chartOptions: AgChartOptions;
    numberOfPicks: number;
    choiceTally: ChoiceTally[] = [];

    constructor(
        private readonly histogramService: HistogramService, // private matchRoomService: MatchRoomService,
    ) {}

    ngOnInit(): void {
        this.histogramService.currentHistogram();
        this.histogramService.choiceTally$.subscribe((choiceTally) => {
            this.choiceTally = choiceTally;
            this.setupChart();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;
        }
    }

    private setupChart(): void {
        //remplis histogramme
        // if (!this.currentQuestion.choices) {
        //     return;
        // }
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
        this.chartOptions = {
            //not change
            title: { text: this.currentQuestion.text },
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

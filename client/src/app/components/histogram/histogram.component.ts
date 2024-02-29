import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
// import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
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
    // @Input() choices: Choice[] | undefined;
    // @Input() questionTitle: string;
    // @Input() picks: number[];
    chartOptions: AgChartOptions;
    ngOnInit(): void {
        if (this.currentQuestion.choices) {
            this.chartOptions = {
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
                // Data: Data to be displayed in the chart,
                data: [
                    { text: this.currentQuestion.choices[0].text, picks: 10 },
                    { text: this.currentQuestion.choices[1].text, picks: 3 },
                    // { text: this.choices[2].text, picks: 1 },
                ],
                series: [{ type: 'bar', xKey: 'text', xName: 'Choix de réponse', yKey: 'picks', yName: 'Nombre de choix' }],
            };
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;

            if (this.currentQuestion.choices) {
                this.chartOptions = {
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
                    // Data: Data to be displayed in the chart,
                    data: [
                        { text: this.currentQuestion.choices[0].text, picks: 10 },
                        { text: this.currentQuestion.choices[1].text, picks: 3 },
                        // { text: this.choices[2].text, picks: 1 },
                    ],
                    series: [{ type: 'bar', xKey: 'text', xName: 'Choix de réponse', yKey: 'picks', yName: 'Nombre de choix' }],
                };
            }
        }
    }
}

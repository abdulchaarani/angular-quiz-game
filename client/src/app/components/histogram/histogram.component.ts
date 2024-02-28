import { Component } from '@angular/core';
// import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent {
    chartOptions: AgChartOptions;
    // TODO : make into Input
    currentQuestion: Question;
    // TODO : Use service to get number of picks instead of hardcoding (could be input? À voir)

    constructor() {
        this.currentQuestion = {
            id: '9d6a424c-dd75-4c48-84a8-e18aab0388ee',
            type: 'QCM',
            text: "Est-ce qu'on le code suivant lance une erreur : const ",
            points: 20,
            choices: [
                { text: 'Non', isCorrect: true },
                { text: 'Oui', isCorrect: false },
                { text: 'ghkghk', isCorrect: false },
            ],
            lastModification: '2024-02-23T14:03:59.605Z',
        };

        if (this.currentQuestion.choices) {
            // Ripped from : https://charts.ag-grid.com/angular/quick-start/
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
                    { text: this.currentQuestion.choices[2].text, picks: 1 },
                ],
                // Series: Defines which chart type and data to use
                series: [{ type: 'bar', xKey: 'text', xName: 'Choix de réponse', yKey: 'picks', yName: 'Nombre de choix' }],
            };
        }
    }
}

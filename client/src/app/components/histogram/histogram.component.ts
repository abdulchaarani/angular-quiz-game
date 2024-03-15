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
    chartOptions: AgChartOptions;
    numberOfPicks: number;

    ngOnInit(): void {
        this.setupChart();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.currentQuestion) {
            const newQuestion = changes.currentQuestion.currentValue;
            this.currentQuestion = newQuestion;
            this.setupChart();  
        }
    }

    private setupChart(): void {
        if (!this.currentQuestion.choices) {
            return;
        }
        const data = [];
        const array: { text: string, isCorrect: boolean | undefined, number: number  }[] = this.currentQuestion.choices.map((choice, index) => ({ 
            text: choice.text, 
            isCorrect : choice.isCorrect,
            number: index + 1, 
        }));

        for (const element of array) {
            let textToShow: string = element.text;
            if (element.isCorrect) {
                textToShow = `${textToShow} (Correct)`;
            } else {
                textToShow = `${textToShow} (Incorrect)`;
            }
            data.push({ text: textToShow, picks: element.number });
        }
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


import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent {
    sortAscending: string = '';

    questions: Question[] = [
        {
            type: 'QCM',
            description: 'Soccer ball shapes',
            question: 'How many white and black shapes are there respectively on a soccer ball',
            points: 20,
            choices: [
                {
                    choice: '30 white, 5 black',
                    isCorrect: false,
                },
                {
                    choice: '20 white, 12 black',
                    isCorrect: true,
                },
                {
                    choice: 'It varies',
                    isCorrect: false,
                },
            ],
            lastModification: '2018-11-13T20:20:39+00:00',
        },
        {
            type: 'QCM',
            description: 'Silver Ratio',
            question: 'The golden ratio is 1:1.618 but do you know the silver ratio',
            points: 40,
            choices: [
                {
                    choice: '1:1.414',
                    isCorrect: true,
                },
                {
                    choice: '3:14:159',
                    isCorrect: false,
                },
                {
                    choice: '1:7:732',
                    isCorrect: false,
                },
                {
                    choice: '1:3:303',
                    isCorrect: false,
                },
            ],
            lastModification: '2024-01-20T14:17:39+00:00',
        },
        {
            type: 'QCM',
            description: 'Leblanc Inspiration',
            question: 'Do you know which author Leblanc borrowed from?',
            points: 60,
            choices: [
                {
                    choice: 'Gaston Leroux',
                    isCorrect: false,
                },
                {
                    choice: 'Arthur Conan Doyle',
                    isCorrect: true,
                },
                {
                    choice: 'Edgar Wallace',
                    isCorrect: false,
                },
                {
                    choice: 'int',
                },
            ],
            lastModification: '2019-03-12T10:11:33+00:00',
        },
    ];

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.questions, event.previousIndex, event.currentIndex);
    }
}

import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-question-list-item',
    templateUrl: './question-list-item.component.html',
    styleUrls: ['./question-list-item.component.scss'],
})
export class QuestionListItemComponent {
    question: Question | undefined = {
        type: 'QCM',
        description: 'Mots réservés JS',
        question: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
        points: 40,
        choices: [
            {
                choice: 'var',
                isCorrect: true,
            },
            {
                choice: 'self',
                isCorrect: false,
            },
            {
                choice: 'this',
                isCorrect: true,
            },
            {
                choice: 'int',
            },
        ],
        lastModification: '2018-11-13T20:20:39+00:00',
    };
}

import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-results-page',
    templateUrl: './results-page.component.html',
    styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent {
    isHost: boolean = true; // TODO: Implement with actual service
    // currentGame: Game;
    pageEvent: PageEvent;
    // currentQuestionIndex: number;
    // picks: number[];
    currentQuestionIndex: number = 0;
    currentGame: Game = {
        id: '0b319d1c-76b2-49da-88c6-8d0e27e9bd4d',
        title: 'demo',
        description: 'evaluation',
        lastModification: '2024-02-23T14:04:17.326Z',
        duration: 10,
        questions: [
            {
                id: 'cad7e463-0c0c-4a07-b6e4-4bc137389e7d',
                type: 'QCM',
                text: 'Parmi les choix suivants, lesquels sont des noms de planètes dans Outer Wilds ?',
                points: 20,
                choices: [
                    { text: 'La Lanterne', isCorrect: false },
                    { text: 'Sombronces', isCorrect: true },
                ],
                lastModification: '2024-02-23T14:04:17.326Z',
            },
            {
                id: 'f601eb03-a969-4da2-8392-b711f0d2ed56',
                type: 'QCM',
                text: 'testtttt',
                points: 30,
                choices: [
                    { text: 'ouii', isCorrect: true },
                    { text: 'nonnn', isCorrect: false },
                ],
                lastModification: '2024-02-23T14:04:17.326Z',
            },
        ],
    };
    picks = [1, 6, 10];

    // ngOnInit(): void {

    // }

    handlePageEvent(e: PageEvent) {
        this.pageEvent = e;
        this.currentQuestionIndex = e.pageIndex;
        console.log(this.currentQuestionIndex);
    }
}

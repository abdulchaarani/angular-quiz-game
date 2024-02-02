import { Injectable } from '@angular/core';
import { GamesService } from './games.service';
import { Game } from '@app/interfaces/game';
import { HttpClient } from '@angular/common/http';
import { Question } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class GamesCreationService extends GamesService {
    constructor(http: HttpClient) {
        super(http);
    }
    game: Game;
    createGame(title: string, description: string, duration: number): Game {
        this.game = {
            id: 0,
            title,
            description,
            lastModification: '2024-02-02T01:20:39.439+00:00',
            duration,
            isVisible: true,
            questions: [],
        };

        console.log('Your game has been submitted', this.game);
        return this.game;
    }

    sendModifiedGame(modifiedGame: Game): Game {
        this.game = modifiedGame;
        console.log('Your game has been submitted', this.game);
        return this.game;
    }

    addQuestionsToGame(addedQuestions: Question[]): Question[] {
        // TODO: Add questions to the game
        console.log('Questions have been added to the game', addedQuestions);
        return addedQuestions;
    }
}

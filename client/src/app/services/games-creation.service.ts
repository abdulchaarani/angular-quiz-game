import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GamesService } from './games.service';

@Injectable({
    providedIn: 'root',
})
export class GamesCreationService extends GamesService {
    game: Game;
    createGame(title: string, description: string, duration: number): void {
        this.game = {
            id: "",
            title,
            description,
            lastModification: new Date().toString(),
            duration,
            isVisible: true,
            questions: [],
        };
        this.uploadGame(this.game);
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

import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GamesService } from './games.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GamesCreationService extends GamesService {
    game: Game;

    createGame(title: string, description: string, duration: number): Observable<string> {
        return new Observable<string>((observer) => {
            this.game = {
                id: '',
                title,
                description,
                lastModification: new Date().toString(),
                duration,
                isVisible: false,
                questions: [
                    {
                        id: '',
                        type: 'QCM',
                        text: 'Question test',
                        points: 10,
                        choices: [
                            {
                                text: 'Question answer 1',
                                isCorrect: true,
                            },
                            {
                                text: 'Question answer 2',
                                isCorrect: false,
                            },
    
                        ],
                        lastModification: new Date().toString(),
                    },
                ],
            };
    
            this.uploadGame(this.game).subscribe({
                next: (response: HttpResponse<string>) => {
                    if (response.body) {
                        this.game = JSON.parse(response.body);
                        this.game.isVisible = false;
                        console.log('Game id', this.game.id);
                        observer.next(this.game.id); // Emit the game ID
                        observer.complete(); // Complete the observable
                    }
                },
                error: (error: HttpErrorResponse) => {
                    console.error('Error while creating the game', error);
                    observer.error(error); // Emit error if any
                },
            });
        });
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

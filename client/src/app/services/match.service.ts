import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { ChoiceValidationService } from './choice-validation.service';

@Injectable({
    providedIn: 'root',
})
export class MatchService extends ApiService<Game> {
    private questionId: string;
    // private gameId: string;

    private questionAdvanceSubject = new Subject<void>();
    private selectedGame: Game;

    questionAdvanced$ = this.questionAdvanceSubject.asObservable();

    constructor(
        http: HttpClient,
        private readonly choiceValidationService: ChoiceValidationService,
    ) {
        super(http, 'match');
    }

    get currentGame() {
        return this.selectedGame;
    }

    set currentGame(game: Game) {
        this.selectedGame = game;
    }

    advanceQuestion() {
        this.questionAdvanceSubject.next();
    }

    // setGameId(id: string) {
    //     this.gameId = id;
    // }

    setQuestionId(id: string) {
        this.questionId = id;
    }

    getBackupGame(id: string) {
        return this.getById(id, 'backups');
    }

    saveBackupGame(id: string) {
        return this.add(this.currentGame, `backups/${id}`);
    }

    deleteBackupGame(id: string) {
        return this.delete(`backups/${id}`);
    }

    validateChoices(choices: string[]) {
        const testChoice = {
            selected: choices,
        };

        return this.choiceValidationService.validateChoices(testChoice, this.currentGame.id, this.questionId);
    }
}

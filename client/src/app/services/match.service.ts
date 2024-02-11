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
    questionAdvanced: Subject<void>;
    private questionId: string;
    // private gameId: string;

    private questionAdvanceSubject = new Subject<void>();
    private selectedGame: Game;
    constructor(
        http: HttpClient,
        private readonly choiceValidationService: ChoiceValidationService,
    ) {
        super(http, 'match');
    }

    get currentGame() {
        return this.selectedGame;
    }

    get questionAdvanced$() {
        return this.questionAdvanceSubject.asObservable(); // test
    }

    set currentGame(game: Game) {
        this.selectedGame = game;
    }

    advanceQuestion() {
        this.questionAdvanceSubject.next(); // test to
    }

    // setGameId(id: string) {
    //     this.gameId = id;
    // }
    getQuestionId() {
        return this.questionId;
    }

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
        return this.delete(`backups/${id}`); // test to
    }

    validateChoices(choices: string[]) {
        const testChoice = {
            selected: choices,
        };

        return this.choiceValidationService.validateChoices(testChoice, this.currentGame.id, this.questionId); // here
    }
}

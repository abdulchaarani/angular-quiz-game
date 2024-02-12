import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root',
})
export class GamesService extends ApiService<Game> {
    isPendingChangesObservable: Observable<boolean>;
    isPendingChangesSource = new BehaviorSubject<boolean>(false);

    constructor(
        public questionService: QuestionService,
        http: HttpClient,
    ) {
        super(http, 'admin/games');
        this.isPendingChangesObservable = this.isPendingChangesSource.asObservable();
    }

    getGames(): Observable<Game[]> {
        return this.getAll();
    }
    getGameById(id: string): Observable<Game> {
        return this.getById('', id);
    }

    toggleGameVisibility(game: Game): Observable<HttpResponse<string>> {
        game.isVisible = !game.isVisible;
        return this.update(game, game.id);
    }

    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.delete(id);
    }

    uploadGame(newGame: Game) {
        return this.add(newGame, '');
    }

    replaceGame(modifiedGame: Game) {
        return this.replace(modifiedGame, modifiedGame.id);
    }

    submitGame(game: Game, state: string) {
        return state === 'modify' ? this.replaceGame(game) : this.uploadGame(game);
    }

    markPendingChanges() {
        this.isPendingChangesSource.next(true);
    }

    resetPendingChanges() {
        this.isPendingChangesSource.next(false);
    }
}

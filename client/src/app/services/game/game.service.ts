import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ManagementState } from '@app/constants/states';
import { Game } from '@app/interfaces/game';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';

@Injectable({
    providedIn: 'root',
})
export class GameService extends CommunicationService<Game> {
    isPendingChangesObservable: Observable<boolean>;
    isPendingChangesSource = new BehaviorSubject<boolean>(false);

    constructor(http: HttpClient) {
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
        return this.put(modifiedGame, modifiedGame.id);
    }

    submitGame(game: Game, state: ManagementState) {
        return state === ManagementState.GameModify ? this.replaceGame(game) : this.uploadGame(game);
    }

    markPendingChanges() {
        this.isPendingChangesSource.next(true);
    }

    resetPendingChanges() {
        this.isPendingChangesSource.next(false);
    }
}

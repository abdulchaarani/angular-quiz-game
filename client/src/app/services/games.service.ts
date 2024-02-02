import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root',
})
export class GamesService extends ApiService<Game> {
    constructor(http: HttpClient) {
        super(http, 'admin/games');
    }

    getGames(): Observable<Game[]> {
        return this.getAll();
    }
    getGameById(id: number): Observable<Game> {
        return this.getById(id.toString());
    }

    toggleGameVisibility(game: Game): Observable<HttpResponse<string>> {
        game.isVisible = !game.isVisible;
        return this.update(game, game.id.toString());
    }

    deleteGame(id: number): Observable<HttpResponse<string>> {
        return this.delete(id.toString());
    }

    uploadGame(newGame: Game) {
        return this.add(newGame, 'json');
    }

    // Keep it in Front-end for now
    downloadGameAsJson(gameToStringify: Game): void {
        const stringifiedGame = JSON.stringify(gameToStringify, (key, value) => {
            if (key !== 'isVisible' && key !== '_id' && key !== '__v') {
                return value;
            }
        });
        const blob = new Blob([stringifiedGame], { type: 'text/json' });
        // Reference: https://runninghill.azurewebsites.net/downloading-objects-as-json-files-in-angular/
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${gameToStringify.title}.json`;
        downloadLink.click();
        window.URL.revokeObjectURL(url);
        downloadLink.remove();
    }
}

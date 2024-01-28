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

    // TODO: change id to string for mongoDb integration?
    getGameById(id: number): Observable<Game> {
        return this.getById(id.toString());
    }

    toggleGameVisibility(id: number): Observable<HttpResponse<string>> {
        return this.update(id.toString());
    }

    deleteGame(id: number): Observable<HttpResponse<string>> {
        return this.delete(id.toString());
    }

    uploadGame(newGame: Game) {
        return this.add(newGame, 'json');

        // TODO: Adapt route when creating a game from scratch
    }

    // Keep it in Front-end for now
    downloadGameAsJson(gameToStringify: Game): void {
        const stringifiedGame = JSON.stringify(gameToStringify, (key, value) => {
            if (key !== 'isVisible') {
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

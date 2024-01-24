import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    // TODO - IMPORTANT : Migrate to Backend by using HTTP requests instead here + Save games on a JSON file (required: import fs from 'fs')
    // This Service should only be used to send the HTTP requests that will be handled by the Backend server
    // The core logic of each function should remain similar, hence why it has been first implemented in the front-end
    private readonly BASE_URL: string = `${environment.serverUrl}/admin/games`;
    private CONTENT_JSON_HEADER = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    constructor(private http: HttpClient) {}

    getGames(): Observable<Game[]> {
        // TODO: Add pipes
        return this.http.get<Game[]>(`${this.BASE_URL}`);
    }

    getGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.BASE_URL}/${id}`);
    }

    // TODO: Return type
    toggleGameVisibility(id: number) {
        return this.http.patch(`${this.BASE_URL}/${id}`, {}).subscribe();
    }

    uploadGame(gameStringified: String, isFromJsonUpload: boolean): void {
        if (isFromJsonUpload) {
            this.http.post<Game>(`${this.BASE_URL}/json`, gameStringified, { headers: this.CONTENT_JSON_HEADER }).subscribe();
        }
    }

    // Keep it in Front-end for now
    downloadGameAsJson(gameToStringify: Game): void {
        const stringifiedGame = JSON.stringify(gameToStringify, function (key, value) {
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

    // TODO: Return type
    deleteGame(id: number) {
        return this.http.delete(`${this.BASE_URL}/${id}`).subscribe();
    }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    private readonly baseUrl: string = `${environment.serverUrl}/admin/games`;
    private contentJsonHeader = new HttpHeaders({
        'Content-Type': 'application/json',
    });

    constructor(private http: HttpClient) {}

    getGames(): Observable<Game[]> {
        // TODO: Add pipes
        return this.http.get<Game[]>(`${this.baseUrl}`);
    }

    // TODO: Case when id == "new"
    getGameById(id: number): Observable<Game> {
        return this.http.get<Game>(`${this.baseUrl}/${id}`);
    }

    // TODO: Return type
    toggleGameVisibility(id: number) {
        return this.http.patch(`${this.baseUrl}/${id}`, {}).subscribe();
    }

    uploadGame(gameStringified: string, isFromJsonUpload: boolean) {
        if (isFromJsonUpload) {
            this.http.post<Game>(`${this.baseUrl}/json`, gameStringified, { headers: this.contentJsonHeader }).subscribe();
        }
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

    // TODO: Return type
    deleteGame(id: number) {
        return this.http.delete(`${this.baseUrl}/${id}`).subscribe();
    }
}

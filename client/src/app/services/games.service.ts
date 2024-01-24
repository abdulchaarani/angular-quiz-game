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

    toggleGameVisibility(id: number) {
        return this.http.patch(`${this.BASE_URL}/${id}`, {}).subscribe();
    }

    // Keep it in front-end for now
    // Make the return type accept void as well AND Observable<Game>
    uploadGameAsJson(file: File) {
        // Reference: https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            console.log(fileReader.result);
            const newGameStringified = fileReader.result?.toString();
            console.log(newGameStringified);
            if (newGameStringified) {
                console.log('POSTING');
                let newGame: Game;
                this.http.post<Game>(`${this.BASE_URL}/json`, newGameStringified, { headers: this.CONTENT_JSON_HEADER }).subscribe((data) => {
                    newGame = data;
                });
            }
        };
        fileReader.readAsText(file);
        // return this.getGames();
    }

    // Keep it in Front-end for now
    downloadGameAsJson(gameToStringify: Game) {
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
        downloadLink.download = `${gameToStringify.title}.json`; // TODO: Change according to title
        downloadLink.click();
        window.URL.revokeObjectURL(url);
        downloadLink.remove();
    }

    deleteGame(id: number) {
        return this.http.delete(`${this.BASE_URL}/${id}`).subscribe();
    }
}

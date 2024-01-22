import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    // TODO - IMPORTANT : Migrate to Backend by using HTTP requests instead here + Save games on a JSON file (required: import fs from 'fs')
    // This Service should only be used to send the HTTP requests that will be handled by the Backend server
    // The core logic of each function should remain similar, hence why it has been first implemented in the front-end
    games: Game[] = [
        {
            id: 0,
            title: 'Hoot Hoot',
            description: 'HOOT HOOT',
            duration: 60,
            isVisible: true,
            lastModification: new Date(2024, 1, 10),
        },
        {
            id: 1,
            title: 'Lune quantique',
            description: 'OOOOOH',
            duration: 60,
            isVisible: true,
            lastModification: new Date(2024, 10, 1),
        },
    ];

    getGames() {
        return this.games;
    }

    getGameById(id: number) {
        return this.games.find((x) => x.id === id);
    }

    addGame(newGame: Game) {
        // TODO: Add verifications
        this.games.push(newGame);
    }

    toggleGameVisibility($event: number) {
        const gameToToggleVisibility = this.getGameById($event);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
        }
    }

    uploadGameAsJson(file: File) {
        // Reference: https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
        let fileReader = new FileReader();
        fileReader.onload = (e) => {
            console.log(fileReader.result);
            const newGameStringified = fileReader.result?.toString();
            if (newGameStringified) {
                const newGame = JSON.parse(newGameStringified);
                newGame.isVisible = true;
                this.addGame(newGame);
            }
        };
        fileReader.readAsText(file);
    }

    downloadGameAsJson($event: number) {
        const gameToStringify = this.getGameById($event);
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
        downloadLink.download = `${gameToStringify?.title}.json`;
        downloadLink.click();
        window.URL.revokeObjectURL(url);
        downloadLink.remove();
    }

    deleteGame($event: number) {
        const gameToDelete = this.getGameById($event);
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== $event);
        }
    }
}

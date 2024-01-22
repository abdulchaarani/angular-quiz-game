import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Injectable({
    providedIn: 'root',
})
export class GamesService {
    // TODO: Migrate to Backend by using HTTP requests instead here
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

    toggleGameVisibility($event: number) {
        const gameToToggleVisibility = this.getGameById($event);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
        }
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
        const a = document.createElement('a');
        a.href = url;
        a.download = `${gameToStringify?.title}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    deleteGame($event: number) {
        const gameToDelete = this.getGameById($event);
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== $event);
        }
    }
}

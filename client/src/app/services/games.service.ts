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

    toggleGameVisibility($event: number) {
        const gameToToggleVisibility = this.games.find((x) => x.id === $event);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
            console.log(gameToToggleVisibility.isVisible);
        }
    }

    deleteGame($event: number) {
        const gameToDelete = this.games.find((x) => x.id === $event);
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== $event);
        }
    }
}

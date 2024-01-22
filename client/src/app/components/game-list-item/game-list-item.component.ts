import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-game-list-item',
    templateUrl: './game-list-item.component.html',
    styleUrls: ['./game-list-item.component.scss'],
})
export class GameListItemComponent {
    @Input() game: Game;

    constructor(private gamesService: GamesService) {}

    toggleGameVisibility() {
        this.gamesService.toggleGameVisibility(this.game.id);
    }

    downloadGameAsJson() {
        this.gamesService.downloadGameAsJson(this.game.id);
    }

    deleteGame() {
        this.gamesService.deleteGame(this.game.id);
    }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-game-list-item',
    templateUrl: './game-list-item.component.html',
    styleUrls: ['./game-list-item.component.scss'],
})
export class GameListItemComponent {
    @Input() game: Game;
    @Output() deleteGameFromList: EventEmitter<Game> = new EventEmitter<Game>();

    constructor(private gamesService: GamesService) {}

    toggleGameVisibility() {
        this.gamesService.toggleGameVisibility(this.game.id);
        this.game.isVisible = !this.game.isVisible; // View logic; TODO -- Change so it's based on backend only
        // TODO: Update accordingly to changes on backend
        // Currently, the change can be triggered only once we refresh the page
    }

    downloadGameAsJson() {
        this.gamesService.downloadGameAsJson(this.game.id);
    }

    deleteGame() {
        this.deleteGameFromList.emit(this.game);
    }
}

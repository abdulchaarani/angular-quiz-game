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
    @Input() isAdminMode: boolean; // TODO: Base itself from the URL instead? (must start by admin...)
    @Output() deleteGameFromList: EventEmitter<string> = new EventEmitter<string>();

    constructor(private gamesService: GamesService) {}

    // TODO notify errors
    toggleGameVisibility() {
        if (this.isAdminMode) {
            this.gamesService.toggleGameVisibility(this.game).subscribe();
        }
    }

    downloadGameAsJson() {
        if (this.isAdminMode) {
            this.gamesService.downloadGameAsJson(this.game);
        }
    }

    deleteGame() {
        if (this.isAdminMode) {
            this.deleteGameFromList.emit(this.game.id);
        }
    }
}

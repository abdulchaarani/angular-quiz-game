import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-game-list-item',
    templateUrl: './game-list-item.component.html',
    styleUrls: ['./game-list-item.component.scss'],
})
export class GameListItemComponent {
    @Input() game: Game;
    @Input() isAdminMode: boolean;
    @Output() deleteGameFromList: EventEmitter<number> = new EventEmitter<number>();

    constructor(private gamesService: GamesService) {}

    toggleGameVisibility() {
        this.gamesService.toggleGameVisibility(this.game).subscribe((response: HttpResponse<string>) => {
            if (response.ok) this.game.isVisible = !this.game.isVisible;
        });
    }

    downloadGameAsJson() {
        this.gamesService.downloadGameAsJson(this.game);
    }

    deleteGame() {
        // Reference: https://stackoverflow.com/questions/43768024/delete-child-and-update-parent-list
        this.deleteGameFromList.emit(this.game.id);
    }
}

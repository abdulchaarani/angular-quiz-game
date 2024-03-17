import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { DownloadGameService } from '@app/services/download-game/download-game.service';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-game-list-item',
    templateUrl: './game-list-item.component.html',
    styleUrls: ['./game-list-item.component.scss'],
})
export class GameListItemComponent {
    @Input() game: Game;
    @Input() isAdminMode: boolean;
    @Output() deleteGameFromList: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private readonly gamesService: GameService,
        private readonly downloadGameService: DownloadGameService,
    ) {}

    toggleGameVisibility() {
        if (this.isAdminMode) {
            this.gamesService.toggleGameVisibility(this.game).subscribe();
        }
    }

    downloadGameAsJson() {
        if (this.isAdminMode) {
            this.downloadGameService.downloadGameAsJson(this.game);
        }
    }

    deleteGame() {
        if (this.isAdminMode) {
            this.deleteGameFromList.emit(this.game.id);
        }
    }
}

import { Component, Input } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-game-list-item',
    templateUrl: './game-list-item.component.html',
    styleUrls: ['./game-list-item.component.scss'],
})
export class GameListItemComponent {
    @Input() game: Game;

    public toggleGameVisibility() {
        this.game.isVisible = !this.game.isVisible;
        window.alert('TODO: Toggle visibility and save in database');
    }

    public downloadGameAsJson() {
        window.alert('TODO: Download JSON');
    }

    public deleteGame() {
        window.alert('TODO: Delete Game');
    }
}

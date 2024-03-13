import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    constructor(readonly gameService: GameService) {}

    ngOnInit(): void {
        this.gameService.getGames();
    }

    onDeleteGameFromList(gameToDeleteId: string): void {
        this.gameService.deleteGame(gameToDeleteId);
    }

    onFileSelected(event: Event) {
        this.gameService.onFileSelected(event);
    }

    addGame(newGame: Game): void {
        this.gameService.uploadGame(newGame);
    }
}

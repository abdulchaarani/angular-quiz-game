import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    order: string = 'ascending';
    subject: string = 'date';
    constructor(
        readonly gameService: GameService,
        readonly historyService: HistoryService,
    ) {}

    ngOnInit(): void {
        this.gameService.getGames();
        this.historyService.getHistory();
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

    onDeleteHistory(): void {
        this.historyService.deleteHistory();
    }
}

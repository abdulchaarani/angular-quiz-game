import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { NotificationService } from '@app/services/notification.service';

@Component({
    selector: 'app-host-page',
    templateUrl: './host-page.component.html',
    styleUrls: ['./host-page.component.scss'],
})
export class HostPageComponent implements OnInit {
    games: Game[] = [];
    selectedGame: Game;
    gameIsValid: boolean;

    constructor(
        private gameService: GamesService,
        private notificationService: NotificationService,
        private matchService: MatchService,
    ) {
        this.gameIsValid = false;
    }

    ngOnInit(): void {
        this.reloadAllGames();
    }

    reloadAllGames(): void {
        this.matchService.getAllGames().subscribe((data: Game[]) => (this.games = data));
    }

    loadSelectedGame(selectedGame: Game): void {
        this.gameService.getGameById(selectedGame.id).subscribe({
            next: (data: Game) => {
                this.selectedGame = data;
                this.validateGame(this.selectedGame);
            },
            error: () => {
                const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'existe plus", 'Actualiser');
                snackBarRef.onAction().subscribe(() => this.reloadAllGames());
            },
        });
    }

    validateGame(selectedGame: Game): void {
        if (selectedGame.isVisible) {
            this.gameIsValid = true;
            this.matchService.currentGame = selectedGame;
            this.matchService.saveBackupGame(selectedGame.id).subscribe();
        } else {
            const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'est plus visible", 'Actualiser');
            snackBarRef.onAction().subscribe(() => this.reloadAllGames());
        }
    }
}

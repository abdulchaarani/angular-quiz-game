import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
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
        public snackBar: MatSnackBar,
    ) {
        this.gameIsValid = false;
    }

    ngOnInit(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            this.games = data.filter((game) => game.isVisible);
        });
    }

    loadAllGames(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            this.games = data.filter((game) => game.isVisible);
        });
    }

    loadSelectedGame(selectedGame: Game): void {
        this.gameService.getGameById(selectedGame.id).subscribe({
            next: (data: Game) => {
                this.selectedGame = data;
                this.selectGame(this.selectedGame);
            },
            error: () => {
                const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'existe plus", 'Actualiser');
                snackBarRef.onAction().subscribe(() => {
                    this.loadAllGames();
                });
            },
        });
    }

    selectGame(selectedGame: Game): void {
        if (selectedGame.isVisible) {
            this.gameIsValid = true;
        } else {
            const snackBarRef = this.snackBar.open("Le jeu sélectionné n'est plus visible", 'Actualiser');
            snackBarRef.onAction().subscribe(() => {
                this.loadAllGames();
            });
        }
    }
}

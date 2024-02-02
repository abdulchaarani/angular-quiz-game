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

    loadGames(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            this.games = data.filter((game) => game.isVisible);
        });
    }

    loadSelectedGame(selectedGame: Game): void {
        this.gameService.getGameById(selectedGame.id).subscribe({
            next: (data: Game) => (this.selectedGame = data),
            error: () => {
                const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'existe plus", 'Actualiser');
                // const snackBarRef = this.snackBar.open("Le jeu sélectionné n'existe plus", 'Actualiser');
                snackBarRef.onAction().subscribe(() => {
                    this.loadGames();
                });
            },
        });
    }

    selectGame(selectedGame: Game): void {
        this.loadSelectedGame(selectedGame);
        try {
            if (this.selectedGame.isVisible === false) {
                throw new Error("Le jeu sélectionné n'est plus visible");
            } else {
                this.gameIsValid = true;
            }
        } catch (error) {
            let errorMessage;
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = String(error);
            }

            const snackBarRef = this.snackBar.open(errorMessage, 'Actualiser');
            snackBarRef.onAction().subscribe(() => {
                this.loadGames();
            });
        }
    }
}

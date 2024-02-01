import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-host-page',
    templateUrl: './host-page.component.html',
    styleUrls: ['./host-page.component.scss'],
})
export class HostPageComponent implements OnInit {
    games: Game[] = [];
    selectedGame: Game;

    constructor(
        private gameService: GamesService,
        public snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            // this.games = data.filter((game) => game.isVisible);
            this.games = [...data];
        });
    }

    loadGames(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            this.games = data.filter((game) => game.isVisible);
        });
    }

    selectGame(selectedGame?: Game): void {
        try {
            if (!selectedGame) {
                throw new Error("Le jeu sélectionné n'existe plus");
            }
            if (selectedGame.isVisible === false) {
                throw new Error("Le jeu sélectionné n'est plus visible");
            }

            this.selectedGame = selectedGame;
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

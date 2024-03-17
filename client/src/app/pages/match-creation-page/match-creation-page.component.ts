import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';

@Component({
    selector: 'app-match-creation-page',
    templateUrl: './match-creation-page.component.html',
    styleUrls: ['./match-creation-page.component.scss'],
})
export class MatchCreationPageComponent implements OnInit {
    games: Game[] = [];
    selectedGame: Game;
    gameIsValid: boolean;

    // Services are required to decouple logic
    // eslint-disable-next-line max-params
    constructor(
        private gameService: GameService,
        private notificationService: NotificationService,
        private matchService: MatchService,
        private questionContextService: QuestionContextService,
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

    reloadSelectedGame(): void {
        this.gameService.getGameById(this.selectedGame.id).subscribe({
            next: (data: Game) => {
                this.selectedGame = data;
                this.revalidateGame();
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
        } else {
            const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'est plus visible", 'Actualiser');
            snackBarRef.onAction().subscribe(() => this.reloadAllGames());
        }
    }

    revalidateGame(): void {
        if (this.selectedGame.isVisible) {
            this.gameIsValid = true;
            this.matchService.currentGame = this.selectedGame;
            this.matchService.saveBackupGame(this.selectedGame.id).subscribe((response: HttpResponse<string>) => {
                if (response.body) {
                    const backupGame = JSON.parse(response.body);
                    this.matchService.currentGame = backupGame;
                }
            });
        } else {
            const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'est plus visible", 'Actualiser');
            snackBarRef.onAction().subscribe(() => this.reloadAllGames());
        }
    }

    createMatch(): void {
        this.reloadSelectedGame();
        this.matchService.createMatch();
    }

    createTestMatch(): void {
        this.reloadSelectedGame();
        this.matchService.createMatch(true);
        this.questionContextService.setContext('testPage');
    }
}

import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatchContext } from '@app/constants/states';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { QuestionService } from '@app/services/question/question.service';

@Component({
    selector: 'app-match-creation-page',
    templateUrl: './match-creation-page.component.html',
    styleUrls: ['./match-creation-page.component.scss'],
})
export class MatchCreationPageComponent implements OnInit {
    games: Game[] = [];
    selectedGame: Game;
    gameIsValid: boolean;
    MatchContext = MatchContext;
    isRandomGame: boolean;

    // Services are required to decouple logic
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameService: GameService,
        private readonly notificationService: NotificationService,
        private readonly matchService: MatchService,
        private readonly questionContextService: QuestionContextService,
        private readonly questionService: QuestionService,
    ) {
        this.gameIsValid = false;
        this.isRandomGame = false;
    }

    ngOnInit(): void {
        this.reloadAllGames();
    }

    reloadAllGames(): void {
        this.matchService.getAllGames().subscribe((data: Game[]) => (this.games = data));
    }

    loadRandomGame(): void {
        this.questionService.getAllQuestions().subscribe({
            next: (data: Question[]) => {
                const questionsCount = [...data].length;
                if (this.hasEnoughRandomQuestions(questionsCount)) {
                    this.selectedGame = {
                        id: '',
                        title: 'Mode aléatoire',
                        description: 'SURPRISE',
                        duration: 20,
                        isVisible: true,
                        questions: [],
                        lastModification: '',
                    };
                }
            },
        });
    }

    hasEnoughRandomQuestions(questionsCount: number): boolean {
        if (questionsCount < 5) {
            this.notificationService.displayErrorMessage("Il n'y a pas assez de questions pour un jeu aléatoire");
            this.isRandomGame = false;
            this.gameIsValid = false;
            return false;
        }
        this.isRandomGame = true;
        this.gameIsValid = true;

        return true;
    }

    loadSelectedGame(selectedGame: Game): void {
        this.isRandomGame = false;
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
        this.isRandomGame = false;
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
                    this.matchService.createMatch();
                }
            });
        } else {
            const snackBarRef = this.notificationService.displayErrorMessageAction("Le jeu sélectionné n'est plus visible", 'Actualiser');
            snackBarRef.onAction().subscribe(() => this.reloadAllGames());
        }
    }

    createMatch(context: MatchContext): void {
        this.questionContextService.setContext(context);
        if (!this.isRandomGame) this.reloadSelectedGame();
        else {
            this.revalidateRandomGame();
        }
    }

    revalidateRandomGame() {
        this.questionService.getAllQuestions().subscribe({
            next: (data: Question[]) => {
                const questionsCount = [...data].length;

                const hasEnoughRandomQuestions = this.hasEnoughRandomQuestions(questionsCount);

                if (hasEnoughRandomQuestions && this.isRandomGame && this.gameIsValid) {
                    this.matchService.currentGame = this.selectedGame;
                    this.matchService.createMatch();
                } else {
                    this.notificationService.displayErrorMessage("Il n'y a pas assez de questions pour un jeu aléatoire");
                }
            },
        });
    }
}

import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root',
})
export class GamesService extends ApiService<Game> {
    isPendingChangesObservable: Observable<boolean>;
    isPendingChangesSource = new BehaviorSubject<boolean>(false);

    constructor(
        private readonly notificationService: NotificationService,
        public questionService: QuestionService,
        http: HttpClient,
    ) {
        super(http, 'admin/games');
        this.isPendingChangesObservable = this.isPendingChangesSource.asObservable();
    }

    getGames(): Observable<Game[]> {
        return this.getAll();
    }
    getGameById(id: string): Observable<Game> {
        return this.getById('', id);
    }

    toggleGameVisibility(game: Game): Observable<HttpResponse<string>> {
        game.isVisible = !game.isVisible;
        return this.update(game.id);
    }

    deleteGame(id: string): Observable<HttpResponse<string>> {
        return this.delete(id);
    }

    uploadGame(newGame: Game) {
        return this.add(newGame, '');
    }

    replaceGame(modifiedGame: Game) {
        return this.replace(modifiedGame, modifiedGame.id);
    }

    submitGame(game: Game, state: string) {
        return state === 'modify' ? this.replaceGame(game) : this.uploadGame(game);
    }

    displaySuccessMessage(successMessage: string) {
        this.notificationService.displaySuccessMessage(successMessage);
    }

    displayErrorMessage(errorMessage: string) {
        this.notificationService.displayErrorMessage(errorMessage);
    }

    markPendingChanges() {
        this.isPendingChangesSource.next(true); // TODO: Test
    }

    resetPendingChanges() {
        this.isPendingChangesSource.next(false); // TODO: Test
    }

    confirmBankUpload(questionTitle: string) {
        return this.notificationService.openConfirmDialog({
            data: {
                icon: 'info_outline',
                title: 'Êtes-vous certain de vouloir ajouter cette question à la banque de questions?',
                text: questionTitle,
            },
        });
    }

    openCreateQuestionModal() {
        return this.notificationService.openCreateQuestionModal();
    }
}

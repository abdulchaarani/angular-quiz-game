import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root',
})
export class GamesService extends ApiService<Game> {
    isPendingChanges = false;

    constructor(
        private readonly notificationService: NotificationService,
        public questionService: QuestionService,
        http: HttpClient,
    ) {
        super(http, 'admin/games');
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

    verifyGame(newGame: Game) {
        return this.add(newGame, 'validate-question');
    }

    submitGame(game: Game, state: string) {
        return state === 'modify' ? this.replaceGame(game) : this.uploadGame(game);
    }

    downloadGameAsJson(gameToStringify: Game): void {
        const stringifiedGame = JSON.stringify(gameToStringify, (key, value) => {
            if (key !== 'isVisible' && key !== '_id' && key !== '__v') {
                return value;
            }
        });
        const blob = new Blob([stringifiedGame], { type: 'text/json' });
        // Reference: https://runninghill.azurewebsites.net/downloading-objects-as-json-files-in-angular/
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${gameToStringify.title}.json`;
        downloadLink.click();
        window.URL.revokeObjectURL(url);
        downloadLink.remove();
    }

    displaySuccessMessage(successMessage: string) {
        this.notificationService.displaySuccessMessage(successMessage);
    }

    displayErrorMessage(errorMessage: string) {
        this.notificationService.displayErrorMessage(errorMessage);
    }

    markPendingChanges() {
        this.isPendingChanges = true;
    }

    resetPendingChanges() {
        this.isPendingChanges = false;
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

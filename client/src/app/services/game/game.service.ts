import { HttpClient, HttpErrorResponse, HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogTextInputComponent } from '@app/components/dialog-text-input/dialog-text-input.component';
import { ManagementState } from '@app/constants/states';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService extends CommunicationService<Game> {
    games: Game[];
    isPendingChangesObservable: Observable<boolean>;
    isPendingChangesSource = new BehaviorSubject<boolean>(false);

    constructor(
        http: HttpClient,
        private readonly notificationService: NotificationService,
        private readonly dialog: MatDialog,
    ) {
        super(http, 'admin/games');
        this.games = [];
        this.isPendingChangesObservable = this.isPendingChangesSource.asObservable();
    }

    getGames(): void {
        this.getAll().subscribe({
            next: (data: Game[]) => (this.games = [...data]),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`Échec d'obtention des jeux 😿\n ${error.message}`),
        });
    }

    getGameById(id: string): Observable<Game> {
        return this.getById('', id);
    }

    toggleGameVisibility(game: Game): Observable<HttpResponse<string>> {
        game.isVisible = !game.isVisible;
        return this.update(game, game.id);
    }

    deleteGame(id: string): void {
        this.delete(id).subscribe({
            next: () => (this.games = this.games.filter((game: Game) => game.id !== id)),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`Échec de supression du jeu 😿\n ${error.message}`),
        });
    }
    addGame(newGame: Game): Observable<HttpResponse<string>> {
        return this.add(newGame, '');
    }

    uploadGame(newGame: Game): void {
        this.addGame(newGame).subscribe({
            next: (response: HttpResponse<string>) => {
                if (response.body) {
                    newGame = JSON.parse(response.body);
                }
                newGame.isVisible = false;
                this.games.push(newGame);
                this.notificationService.displaySuccessMessage('Jeu ajouté avec succès! 😺');
            },
            error: (error: HttpErrorResponse) => {
                if (error.message === 'Un jeu du même titre existe déjà.' || error.status === HttpStatusCode.Conflict) {
                    this.openDialog(newGame);
                } else {
                    this.notificationService.displayErrorMessage(`Le jeu n'a pas pu être ajouté. 😿 \n ${error.message}`);
                }
            },
        });
    }

    onFileSelected(event: Event): void {
        // Reference: https://blog.angular-university.io/angular-file-upload/
        // Reference: https://stackoverflow.com/questions/43176560/property-files-does-not-exist-on-type-eventtarget-error-in-typescript
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        this.readFile(file);
    }

    async readFile(file: File): Promise<void | undefined> {
        // Reference: https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
        return new Promise<void>(() => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const stringifiedGame = fileReader.result?.toString();
                this.addStringifiedGame(stringifiedGame);
            };
            fileReader.readAsText(file);
        });
    }

    addStringifiedGame(newGameStringified: string | undefined): void {
        if (newGameStringified) {
            const newGame = JSON.parse(newGameStringified);
            this.uploadGame(newGame);
        }
    }

    openDialog(newGame: Game): void {
        const dialogRef = this.dialog.open(DialogTextInputComponent, {
            data: { input: '', title: 'Veillez renommer le jeu.', placeholder: 'Nouveau titre' },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            newGame.title = result;
            this.uploadGame(newGame);
        });
    }

    replaceGame(modifiedGame: Game) {
        return this.put(modifiedGame, modifiedGame.id);
    }

    submitGame(game: Game, state: ManagementState) {
        return state === ManagementState.GameModify ? this.replaceGame(game) : this.addGame(game);
    }

    markPendingChanges() {
        this.isPendingChangesSource.next(true);
    }

    resetPendingChanges() {
        this.isPendingChangesSource.next(false);
    }
}

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogRenameGameComponent } from '@app/components/dialog-rename-game/dialog-rename-game.component';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    games: Game[] = [];

    constructor(
        private dialog: MatDialog,
        private readonly gamesService: GamesService,
        private readonly notificationService: NotificationService,
    ) {}

    ngOnInit(): void {
        this.getGames();
    }

    getGames(): void {
        this.gamesService.getGames().subscribe({
            next: (data: Game[]) => (this.games = [...data]),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`Échec d'obtention des jeux 😿\n ${error.message}`),
        });
    }

    onDeleteGameFromList(gameToDeleteId: string): void {
        this.gamesService.deleteGame(gameToDeleteId).subscribe({
            next: () => (this.games = this.games.filter((game: Game) => game.id !== gameToDeleteId)),
            error: (error: HttpErrorResponse) => this.notificationService.displayErrorMessage(`Échec de supression du jeu 😿\n ${error.message}`),
        });
    }

    addGame(newGame: Game): void {
        this.gamesService.uploadGame(newGame).subscribe({
            next: (response: HttpResponse<string>) => {
                if (response.body) {
                    newGame = JSON.parse(response.body);
                }
                newGame.isVisible = false;
                this.games.push(newGame);
                this.notificationService.displaySuccessMessage('Jeu ajouté avec succès! 😺');
            },
            error: (error: HttpErrorResponse) => {
                if (error.message === 'Requête add\n Un jeu du même titre existe déjà.') {
                    this.openDialog(newGame);
                } else {
                    this.notificationService.displayErrorMessage(`Le jeu n'a pas pu être ajouté. 😿 \n ${error}`);
                }
            },
        });
    }

    // TODO: See if the logic can be migrated to games.service.ts (Challenge: Returning the read game while managing fileReader)
    onFileSelected(event: Event): void {
        // Reference: https://blog.angular-university.io/angular-file-upload/
        // Reference: https://stackoverflow.com/questions/43176560/property-files-does-not-exist-on-type-eventtarget-error-in-typescript
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];

        if (file) {
            // Reference: https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const newGameStringified = fileReader.result?.toString();
                if (newGameStringified) {
                    const newGame = JSON.parse(newGameStringified);
                    this.addGame(newGame);
                }
            };
            fileReader.readAsText(file);
        }
    }

    openDialog(newGame: Game): void {
        const dialogRef = this.dialog.open(DialogRenameGameComponent, {
            data: '',
        });

        dialogRef.afterClosed().subscribe((result) => {
            newGame.title = result;
            this.addGame(newGame);
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    sortAscending: string = '';
    games: Game[] = [];

    constructor(private gamesService: GamesService) {}

    ngOnInit(): void {
        this.getGames();
    }

    getGames(): void {
        this.gamesService.getGames().subscribe((games: Game[]) => (this.games = [...games]));
    }

    onDeleteGameFromList(gameToDelete: Game) {
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== gameToDelete.id); // TODO: Check if it's "legal" for the correction
            this.gamesService.deleteGame(gameToDelete.id);
        }
    }

    // TODO: Find actual type of event to remove the "any" (which is currently illegal)
    // TODO: See if the logic can be migrated to games.service.ts (Challenge: Returning the read game while managing fileReader)
    onFileSelected(event: unknown) {
        // Reference: https://blog.angular-university.io/angular-file-upload/
        const file: File = event.target.files[0];
        if (file) {
            // Reference: https://stackoverflow.com/questions/47581687/read-a-file-and-parse-its-content
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const newGameStringified = fileReader.result?.toString();
                if (newGameStringified) {
                    this.gamesService.uploadGame(newGameStringified, true);

                    // TODO: See if this is legal
                    const newGame = JSON.parse(newGameStringified);
                    newGame.isVisible = true;
                    this.games.push(newGame);
                }
            };
            fileReader.readAsText(file);
        }
    }
}

import { HttpResponse } from '@angular/common/http';
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

    onDeleteGameFromList(gameToDeleteId: string) {
        this.gamesService.deleteGame(gameToDeleteId).subscribe((response: HttpResponse<string>) => {
            if (response.ok) this.games = this.games.filter((x) => x.id !== gameToDeleteId);
        });
    }

    // TODO: Find actual type of event to remove the "any" (which is currently illegal)
    // TODO: See if the logic can be migrated to games.service.ts (Challenge: Returning the read game while managing fileReader)
    onFileSelected(event: Event) {
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
                    this.gamesService.uploadGame(newGame).subscribe((response: HttpResponse<string>) => {
                        if (response.ok) {
                            newGame.isVisible = true;
                            this.games.push(newGame);
                        }
                    });
                }
            };
            fileReader.readAsText(file);
        }
    }
}
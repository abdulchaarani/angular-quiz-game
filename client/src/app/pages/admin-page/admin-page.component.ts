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
        this.gamesService.getGames().subscribe((games) => (this.games = games));
    }

    onDeleteGameFromList(gameToDelete: Game) {
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== gameToDelete.id);
            this.gamesService.deleteGame(gameToDelete.id);
        }
    }

    // TODO: Find actual type of event
    onFileSelected(event: any) {
        // Reference: https://blog.angular-university.io/angular-file-upload/
        const file: File = event.target.files[0];
        if (file) {
            this.gamesService.uploadGameAsJson(file);
            // const upload$ = this.http.post('/admin/json-game', formData);
            // upload$.subscribe();
        }
    }
}

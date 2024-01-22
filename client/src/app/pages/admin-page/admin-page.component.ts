import { Component } from '@angular/core';
import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    sortAscending: string = '';

    constructor(private gamesService: GamesService) {}

    get games() {
        return this.gamesService.games;
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

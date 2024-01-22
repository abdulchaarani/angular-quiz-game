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
}

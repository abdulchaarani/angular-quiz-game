import { Component } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
    players: Player[] = [
        { username: 'Bibi', score: 1000, bonusCount: 10, isPlaying: true },
        { username: 'Totoro', score: 7, bonusCount: 0, isPlaying: true },
        { username: 'Kiki', score: 6, bonusCount: 0, isPlaying: true },
        { username: 'Nausicaa', score: 5, bonusCount: 0, isPlaying: false },
        { username: 'Pom Poko', score: 8, bonusCount: 0, isPlaying: true },
        { username: 'Porco Rosso', score: 9, bonusCount: 0, isPlaying: false },
        { username: 'Lorem', score: 4, bonusCount: 0, isPlaying: true },
        { username: 'Ipsum', score: 3, bonusCount: 0, isPlaying: true },
        { username: 'Kaneshiro', score: 2, bonusCount: 0, isPlaying: true },
    ];
}

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    sortAscending: string = '';

    games: Game[] = [
        {
            id: 0,
            title: 'Hoot Hoot',
            description: 'HOOT HOOT',
            duration: 60,
            isVisible: true,
            lastModification: new Date(2024, 1, 10),
        },
        {
            id: 1,
            title: 'Lune quantique',
            description: 'OOOOOH',
            duration: 60,
            isVisible: true,
            lastModification: new Date(2024, 2, 15),
        },
    ];

    drop(event: CdkDragDrop<Game[]>) {
        moveItemInArray(this.games, event.previousIndex, event.currentIndex);
    }
}

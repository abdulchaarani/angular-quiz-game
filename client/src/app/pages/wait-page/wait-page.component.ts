import { Component } from '@angular/core';

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent {
    // TODO: Replace Dummy values using actual services with backend implementation
    isHost: boolean = true;
    code: string = '7777';
    playerUsernames: string[] = ['Totoro', 'Kiki', 'Jiji', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
    isLocked: boolean;
    currentUsername: string = 'Organisateur';

    constructor() {
        // TODO: Inject services in parameter + initialize values accordingly
    }

    rejectPlayerUsername(name: string) {}

    startMatch() {
        // TODO: Check if isLocked + if at least one player
    }
}

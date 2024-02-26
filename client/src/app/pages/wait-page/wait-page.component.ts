import { Component } from '@angular/core';

@Component({
    selector: 'app-wait-page',
    templateUrl: './wait-page.component.html',
    styleUrls: ['./wait-page.component.scss'],
})
export class WaitPageComponent {
    isHost: boolean = true;
    code: string = 'Dummy game code';
    playerUsernames: string[] = ['Totoro', 'Kiki', 'Jiji'];
    isLocked: boolean;

    constructor() {
        // TODO: Inject services in parameter + initialize values accordingly
    }

    rejectPlayerUsername(name: string) {}

    startMatch() {
        // TODO: Check if isLocked + if at least one player
    }
}

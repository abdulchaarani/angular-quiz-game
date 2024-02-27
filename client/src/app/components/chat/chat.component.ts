import { Component } from '@angular/core';
import { Message } from '@app/interfaces/message';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    currentUsername: string = 'Utilisateur Chose Bine';
    messages: Message[] = [
        { author: 'Bibi', text: 'TOUPIIIIIE', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
        { author: 'Bibi', text: 'WAAAH', date: new Date() },
    ];
}

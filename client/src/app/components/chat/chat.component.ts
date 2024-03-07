import { Component } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    messages: Message[] = [
        { author: 'Binou', text: 'TOUPIIIIIE', date: new Date() },
        {
            author: 'Bibi',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            date: new Date(),
        },
        {
            author: 'Organisateur',
            text: 'Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. ',
            date: new Date(),
        },
        {
            author: 'Jiji',
            text: 'Ut velit mauris, egestas sed, gravida nec, ornare ut, mi. ',
            date: new Date(),
        },
        {
            author: 'Fifi',
            text: 'Curabitur aliquet pellentesque diam. ',
            date: new Date(),
        },
        {
            author: 'Bibi',
            text: 'Mauris ullamcorper felis vitae erat. ',
            date: new Date(),
        },
        { author: 'Kaneshiro', text: 'MY BAAAAANK', date: new Date() },
    ];
    constructor(readonly matchRoomService: MatchRoomService) {}
}

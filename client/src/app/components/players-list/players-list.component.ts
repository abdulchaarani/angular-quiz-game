import { Component, Input } from '@angular/core';
import { Player } from '@app/interfaces/player';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent {
    @Input() players: Player[];
    constructor(readonly matchRoomService: MatchRoomService, readonly chatService: ChatService) {}

    toggleChat(player: Player): void {
        this.chatService.toggleChatState(this.matchRoomService.getRoomCode(), player.username);
    }
}    

import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Message } from '@app/interfaces/message';

import { ChatService } from '@app/services/chat/chat.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { HOST_USERNAME } from '@common/constants/match-constants';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewChecked, OnInit, OnDestroy {
    @ViewChild('messagesContainer', { static: true }) messagesContainer: ElementRef;

    constructor(
        readonly matchRoomService: MatchRoomService,
        readonly chatService: ChatService,
    ) {}

    ngOnInit(): void {
        this.chatService.displayOldMessages();
        this.chatService.handleReceivedMessages();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    ngOnDestroy() {
        this.chatService.socketHandler.socket.removeListener('newMessage');
        this.chatService.socketHandler.socket.removeListener('fetchOldMessages');
    }

    sendMessage(messageText: string): void {
        const isChatActiveForPlayer = this.matchRoomService.getPlayerByUsername(this.matchRoomService.getUsername())?.isChatActive;
        const isPlayerHost = this.matchRoomService.getUsername() === HOST_USERNAME;
        if (messageText) { 
            const newMessage: Message = {
                text: messageText,
                author: this.matchRoomService.getUsername(),
                date: new Date(),
            };
            if (isChatActiveForPlayer || isPlayerHost) {
                this.chatService.sendMessage(this.matchRoomService.getRoomCode(), newMessage);
            }
        }
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}

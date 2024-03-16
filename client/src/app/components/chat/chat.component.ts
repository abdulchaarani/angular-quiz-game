import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { Message } from '@app/interfaces/message';

import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChatService } from '@app/services/chat/chat.service';

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
        if (messageText.trim() !== '') {
            const newMessage: Message = {
                text: messageText,
                author: this.matchRoomService.getUsername(),
                date: new Date(),
            };
            this.chatService.sendMessage(this.matchRoomService.getMatchRoomCode(), newMessage);
        }
    }

    private scrollToBottom(): void {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
}

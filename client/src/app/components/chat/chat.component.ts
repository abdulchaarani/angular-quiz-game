import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChatService } from '@app/services/chat/chat.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewChecked {
    @ViewChild('messagesContainer', { static: true }) messagesContainer: ElementRef;
    message: string = '';
    messages: Message[] = [];
    constructor(
        readonly matchRoomService: MatchRoomService,
        readonly chatService: ChatService,
    ) { }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    ngOnInit() {
        this.chatService.messages.get(this.matchRoomService.getMatchRoomCode());
        this.chatService.fetchOldMessages();
        console.log('messages',this.chatService.messages.get(this.matchRoomService.getMatchRoomCode()));
    }

    sendMessage(messageText: string): void {
        if (messageText.trim() !== '') {
            const newMessage: Message = {
                text: messageText,
                author: this.matchRoomService.getUsername(),
                date: new Date(),
            };

            this.chatService.sendMessage(this.matchRoomService.getMatchRoomCode(), newMessage);
            console.log(this.chatService.messages.get(this.matchRoomService.getMatchRoomCode()));
        }
    }

    private scrollToBottom(): void {
        try {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        } catch (err) {
            console.error(err);
        }
    }
}

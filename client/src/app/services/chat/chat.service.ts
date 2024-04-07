import { Injectable } from '@angular/core';
import { Message } from '@app/interfaces/message';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { MessageInfo } from '@common/interfaces/message-info';
import { ChatEvents } from '@common/events/chat.events';
//import { ChatStateInfo } from '@app/constants/question-creation';
//import { Player } from '@app/interfaces/player';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    constructor(
        public socketHandler: SocketHandlerService,
        readonly matchRoomService: MatchRoomService, //readonly playerRoomService PlayerRoomService,
    ) {
        //this.onPlayerDeactivated();
    }

    sendMessage(roomCode: string, message: Message): void {
        const messageInfo: MessageInfo = { roomCode, message };
        this.socketHandler.send(ChatEvents.RoomMessage, messageInfo);
    }

    sendMessagesHistory(roomCode: string) {
        this.socketHandler.send(ChatEvents.SendMessagesHistory, roomCode);
    }

    fetchOldMessages() {
        this.socketHandler.on(ChatEvents.FetchOldMessages, (messages: Message[]) => {
            this.matchRoomService.messages = messages;
        });
    }

    displayOldMessages() {
        this.fetchOldMessages();
        this.sendMessagesHistory(this.matchRoomService.getRoomCode());
    }

    handleReceivedMessages() {
        this.socketHandler.on(ChatEvents.NewMessage, (messageInfo: MessageInfo) => {
            this.matchRoomService.messages.push(messageInfo.message);
        });
    }

    toggleChatState(roomCode: string, playerUsername: string) {
        // const player = this.matchRoomService.getPlayerByUsername(playerUsername);
        this.socketHandler.send(ChatEvents.ChangeChatState, { roomCode, playerUsername });

        // this.socketHandler.on(ChatEvents.SendBackState, (data: boolean) => {
        //     // const player = this.matchRoomService.getPlayerByUsername();
        //     console.log('data', data);
        //     if (player) {
        //         player.isChatActive = data;
        //         console.log(this.matchRoomService.getPlayerByUsername(this.matchRoomService.getUsername()));
        //     }

        //this.socketHandler.send('turnoff', { playerUsername, isChatActive: Boolean });

        // if (player) {
        //     player.isChatActive = !player.isChatActive;
        //     console.log(player.isChatActive);
        // }
    }
    onPlayerDeactivated(username: string) {
        const player = this.matchRoomService.getPlayerByUsername(username);
        this.socketHandler.on(ChatEvents.SendBackState, (data: boolean) => {
            // const player = this.matchRoomService.getPlayerByUsername();
            console.log('data', data);
            if (player) {
                player.isChatActive = data;
                console.log(player); 
            }
            //console.log(this.matchRoomService.getPlayerByUsername(this.matchRoomService.getUsername()));
        });
    }
}

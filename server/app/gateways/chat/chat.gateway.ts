import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from '@app/services/chat/chat.service';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '@common/events/chat.events';
import { MessageInfo } from '@common/interfaces/message-info';
import { ChatStateInfo } from '@common/interfaces/message-info';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchEvents } from '@common/events/match.events';
import { CHAT_DEACTIVATED, CHAT_REACTIVATED } from '@app/constants/chat-state-messages';

const INDEX_NOT_FOUND = -1;

@WebSocketGateway({ cors: true })
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly chatService: ChatService,
        readonly playerRoomService: PlayerRoomService,
        private readonly matchRoomService: MatchRoomService,
    ) {}

    @SubscribeMessage(ChatEvents.RoomMessage)
    handleIncomingRoomMessages(@ConnectedSocket() socket: Socket, @MessageBody() data: MessageInfo) {
        this.chatService.addMessage(data.message, data.roomCode);
        this.sendMessageToClients(data);
    }

    @SubscribeMessage(ChatEvents.SendMessagesHistory)
    sendMessagesHistory(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        if (socket.rooms.has(matchRoomCode)) {
            this.handleSentMessagesHistory(matchRoomCode);
        }
    }

    @SubscribeMessage(ChatEvents.ChangeChatState)
    changeMessagingState(@ConnectedSocket() socket: Socket, @MessageBody() data: ChatStateInfo) {
        const roomIndex = this.matchRoomService.getRoomIndex(data.roomCode);
        const playerIndex = this.matchRoomService.getRoom(data.roomCode)?.players.findIndex((player) => {
            return player.username === data.playerUsername;
        });

        let currentPlayerChatState = this.matchRoomService.matchRooms[roomIndex].players[playerIndex].isChatActive;

        if (roomIndex !== INDEX_NOT_FOUND && playerIndex !== INDEX_NOT_FOUND) {
            // this.matchRoomService.matchRooms[roomIndex].players[playerIndex].isChatActive =
            //     !this.matchRoomService.matchRooms[roomIndex].players[playerIndex].isChatActive;
            currentPlayerChatState = !currentPlayerChatState;
        }

        const player = this.playerRoomService.getPlayerByUsername(data.roomCode, data.playerUsername);
        this.server.to(data.roomCode).emit(ChatEvents.ReturnCurrentChatState, currentPlayerChatState);

        if (!currentPlayerChatState) {
            this.server.in(player.socket.id).emit(MatchEvents.Error, CHAT_DEACTIVATED);
        } else {
            this.server.in(player.socket.id).emit(ChatEvents.ChatReactivated, CHAT_REACTIVATED);
        }
    }

    sendMessageToClients(data: MessageInfo) {
        this.server.to(data.roomCode).emit(ChatEvents.NewMessage, data);
    }

    handleSentMessagesHistory(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit(ChatEvents.FetchOldMessages, this.chatService.getMessages(matchRoomCode));
    }
}

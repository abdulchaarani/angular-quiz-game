import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from '@app/services/chat/chat.service';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from '@common/events/chat.events';
import { MessageInfo } from '@common/interfaces/message-info';
import { ChatStateInfo } from '@common/interfaces/message-info';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly chatService: ChatService,
        readonly playerRoomService: PlayerRoomService,
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

    @SubscribeMessage('change-chat-state')
    sendMessages(@ConnectedSocket() socket: Socket, @MessageBody() usernameRoomCode: ChatStateInfo) {
        this.playerRoomService.toggleChatStateForPlayer(usernameRoomCode.matchRoomCode, usernameRoomCode.playerUsername);
    }

    sendMessageToClients(data: MessageInfo) {
        this.server.to(data.roomCode).emit(ChatEvents.NewMessage, data);
    }

    handleSentMessagesHistory(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit(ChatEvents.FetchOldMessages, this.chatService.getMessages(matchRoomCode));
    }
}

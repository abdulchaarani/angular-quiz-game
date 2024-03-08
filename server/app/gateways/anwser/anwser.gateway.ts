import { AnswerService } from '@app/services/answer/answer.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnswerEvents } from './answer.gateway.events';

interface UserInfo {
    roomCode: string;
    username: string;
}
interface ChoiceInfo {
    userInfo: UserInfo;
    choice: string;
}

@WebSocketGateway({ cors: true })
export class AnwserGateway {
    @WebSocketServer() private server: Server;

    constructor(private answerService: AnswerService) {}

    @SubscribeMessage(AnswerEvents.SelectChoice)
    selectChoice(@ConnectedSocket() socket: Socket, @MessageBody() choice: ChoiceInfo) {
        console.log('Anwser gateway works', choice);
    }
}

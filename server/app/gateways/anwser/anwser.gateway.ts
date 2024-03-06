import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnswerEvents } from './answer.gateway.events';

@WebSocketGateway({ cors: true })
export class AnwserGateway {
    @WebSocketServer() private server: Server;

    @SubscribeMessage(AnswerEvents.SelectChoice)
    handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() data) {
        console.log('Anwser gateway works', data);
    }
}

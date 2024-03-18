import { AnswerService } from '@app/services/answer/answer.service';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnswerEvents } from './answer.gateway.events';
import { ChoiceInfo } from '@common/interfaces/choice-info';
import { UserInfo } from '@common/interfaces/user-info';
@WebSocketGateway({ cors: true })
export class AnswerGateway {
    @WebSocketServer() private server: Server;

    constructor(private readonly answerService: AnswerService) {}

    @SubscribeMessage(AnswerEvents.SelectChoice)
    selectChoice(@ConnectedSocket() socket: Socket, @MessageBody() choice: ChoiceInfo) {
        this.answerService.updateChoice(choice.choice, true, choice.userInfo.username, choice.userInfo.roomCode);
    }

    @SubscribeMessage(AnswerEvents.DeselectChoice)
    deselectChoice(@ConnectedSocket() socket: Socket, @MessageBody() choice: ChoiceInfo) {
        this.answerService.updateChoice(choice.choice, false, choice.userInfo.username, choice.userInfo.roomCode);
    }

    @SubscribeMessage(AnswerEvents.SubmitAnswer)
    submitAnswer(@ConnectedSocket() socket: Socket, @MessageBody() userInfo: UserInfo) {
        this.answerService.submitAnswer(userInfo.username, userInfo.roomCode);
    }
}

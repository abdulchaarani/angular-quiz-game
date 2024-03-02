import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { TimeService } from '@app/services/time/time.service';
import { Injectable } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchEvents } from './match.gateway.events';

interface joinInfo {
    roomCode: string;
    username: string;
}

// Future TODO: Open socket only if code and user are valid + Allow host to be able to disconnect banned players
@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private matchRoomService: MatchRoomService,
        private timeService: TimeService,
        private matchService: MatchService,
    ) {}

    @SubscribeMessage(MatchEvents.JoinRoom)
    joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: joinInfo) {
        if (!this.matchRoomService.isValidMatchRoomCode(data.roomCode) || !this.matchRoomService.isValidUsername(data.roomCode, data.username)) {
            return;
        }
        socket.join(data.roomCode);
        const newPlayer = this.matchRoomService.addPlayer(data.roomCode, data.username);

        console.log(this.matchRoomService.getPlayers(data.roomCode));
        return { code: data.roomCode, username: newPlayer.username };
    }

    @SubscribeMessage(MatchEvents.RoomMessage)
    roomMessage(@ConnectedSocket() socket: Socket, @MessageBody() message: string) {
        // TODO: Change message for Message with interface instead of string only
        /*
        if (socket.rooms.has(this.room)) {
            this.server.to(this.room).emit(MatchEvents.RoomMessage, message);
        }
        */
    }

    @SubscribeMessage(MatchEvents.CreateRoom)
    createRoom(@ConnectedSocket() socket: Socket, @MessageBody() stringifiedGame: string) {
        const selectedGame: Game = JSON.parse(stringifiedGame);
        const newMatchRoom: MatchRoom = this.matchRoomService.addMatchRoom(selectedGame);
        socket.join(newMatchRoom.code);
        return { code: newMatchRoom.code };
    }

    @SubscribeMessage(MatchEvents.StartTimer)
    startTimer(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        const clientRoom = this.matchRoomService.getMatchRoomByCode(roomCode);
        const currentGame = this.matchService.getBackupGame(clientRoom.game.id);
        this.timeService.startTimer(roomCode, currentGame.duration, this.server);
    }

    handleConnection(@ConnectedSocket() socket: Socket) {
        console.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        socket.emit('Hello', 'Hello World!');
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }
}

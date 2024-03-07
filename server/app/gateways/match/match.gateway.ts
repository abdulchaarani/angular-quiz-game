import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
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

interface UserInfo {
    roomCode: string;
    username: string;
}

interface TimerInfo {
    roomCode: string;
    time: number;
}

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private matchRoomService: MatchRoomService,
        private playerRoomService: PlayerRoomService,
        private timeService: TimeService,
        private matchBackupService: MatchBackupService,
    ) {}

    @SubscribeMessage(MatchEvents.JoinRoom)
    joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: UserInfo) {
        if (!this.matchRoomService.isValidMatchRoomCode(data.roomCode) || !this.playerRoomService.isValidUsername(data.roomCode, data.username)) {
            this.server.in(socket.id).disconnectSockets();
        } else {
            socket.join(data.roomCode);
            const newPlayer = this.playerRoomService.addPlayer(socket, data.roomCode, data.username);
            return { code: data.roomCode, username: newPlayer.username };
        }
    }

    @SubscribeMessage(MatchEvents.CreateRoom)
    createRoom(@ConnectedSocket() socket: Socket, @MessageBody() stringifiedGame: string) {
        const selectedGame: Game = JSON.parse(stringifiedGame);
        const newMatchRoom: MatchRoom = this.matchRoomService.addMatchRoom(selectedGame, socket);
        socket.join(newMatchRoom.code);
        return { code: newMatchRoom.code };
    }

    // TODO: Consider using HTTP instead ?
    @SubscribeMessage(MatchEvents.ToggleLock)
    toggleLock(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        this.matchRoomService.toggleLockMatchRoom(matchRoomCode);
    }

    @SubscribeMessage(MatchEvents.BanUsername)
    banUsername(@ConnectedSocket() socket: Socket, @MessageBody() data: UserInfo) {
        this.playerRoomService.addBannedUsername(data.roomCode, data.username);
        const playerToBan = this.playerRoomService.getPlayerByUsername(data.roomCode, data.username);
        if (playerToBan) {
            this.playerRoomService.deletePlayer(data.roomCode, data.username);
            this.server.in(playerToBan.socket.id).disconnectSockets();
        }
        this.sendPlayersData(socket, data.roomCode);
    }

    @SubscribeMessage(MatchEvents.SendPlayersData)
    sendPlayersData(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        if (socket.rooms.has(matchRoomCode)) {
            this.handleSendPlayersData(matchRoomCode);
        }
    }

    @SubscribeMessage(MatchEvents.StartTimer)
    startTimer(@ConnectedSocket() socket: Socket, @MessageBody() data: TimerInfo) {
        this.timeService.startTimer(data.roomCode, data.time, this.server);
    }

    @SubscribeMessage(MatchEvents.StopTimer)
    stopTimer(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.timeService.stopTimer(roomCode, this.server);
    }

    // eslint-disable-next-line no-unused-vars
    handleConnection(@ConnectedSocket() socket: Socket) {
        // eslint-disable-next-line
        // console.log(`Connexion par l'utilisateur avec id : ${socket.id}`); // TODO: Remove once debugging is finished
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        // eslint-disable-next-line
        // console.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`); // TODO: Remove once debugging is finished
        const matchRoomCode = this.matchRoomService.getRoomCodeByHostSocket(socket.id);
        if (matchRoomCode) {
            this.server.in(matchRoomCode).disconnectSockets();
            this.matchRoomService.deleteMatchRoom(matchRoomCode);
            return;
        }
        const roomCode = this.playerRoomService.deletePlayerBySocket(socket.id);
        if (roomCode) {
            this.handleSendPlayersData(roomCode);
            // TODO: If no more players left, disconnect the host and delete the match.
        }
    }

    handleSendPlayersData(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit('fetchPlayersData', this.playerRoomService.getPlayersStringified(matchRoomCode));
    }

    // TODO: Start match: Do not forget to make isPlaying = true in MatchRoom object!!
}

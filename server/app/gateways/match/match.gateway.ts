import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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

interface PlayerInfo {
    start: boolean;
    gameTitle: string;
}

interface TimerInfo {
    roomCode: string;
    time: number;
}

interface PlayerInfo {
    start: boolean;
    gameTitle: string;
}

// TODO: Open socket only if code and user are valid + Allow host to be able to disconnect banned players

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    private readonly COUNTDOWN_TIME = 5;
    constructor(
        private matchRoomService: MatchRoomService,
        private playerRoomService: PlayerRoomService,
        private timeService: TimeService,
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

    @SubscribeMessage(MatchEvents.UpdateScore)
    updateScore(@ConnectedSocket() socket: Socket, @MessageBody() data: UserInfo, @MessageBody() points: number) {
        this.playerRoomService.updateScore(data.roomCode, data.username, points);
        this.sendPlayersData(socket, data.roomCode);
    }

    @SubscribeMessage(MatchEvents.SendPlayersData)
    sendPlayersData(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        if (socket.rooms.has(matchRoomCode)) {
            this.handleSendPlayersData(matchRoomCode);
        }
    }

    // TODO: Start match: Do not forget to make isPlaying = true in MatchRoom object!!
    @SubscribeMessage(MatchEvents.StartMatch)
    startMatch(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        if (this.matchRoomService.canStartMatch(roomCode)) {
            const gameTitle = this.matchRoomService.getGameTitle(roomCode);
            const playerInfo: PlayerInfo = {
                start: true,
                gameTitle: gameTitle,
            };
            socket.to(roomCode).emit('matchStarting', playerInfo); //TODO: add matchstarting to the events

            this.timeService.startTimer(roomCode, this.COUNTDOWN_TIME + 1, this.server);
        }
    }

    @SubscribeMessage('startQuiz')
    letsStartQuiz(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.matchRoomService.markGameAsPlaying(roomCode);
        this.matchRoomService.sendFirstQuestion(this.server, roomCode);
        this.timeService.startTimer(roomCode, this.matchRoomService.getGameDuration(roomCode), this.server);
    }

    @SubscribeMessage(MatchEvents.NextQuestion)
    nextQuestion(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.matchRoomService.sendNextQuestion(this.server, roomCode);
    }

    @OnEvent(MatchEvents.TimerExpired)
    handleTimerExpiredEvent(matchRoomCode: string) {
        if (this.matchRoomService.isGamePlaying(matchRoomCode)) return;
        this.matchRoomService.sendNextQuestion(this.server, matchRoomCode);
        this.server.in(matchRoomCode).emit('beginQuiz');
        this.matchRoomService.markGameAsPlaying(matchRoomCode);
    }

    // @SubscribeMessage(MatchEvents.StopTimer)
    // stopTimer(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
    //     this.timeService.stopTimer(roomCode, this.server);
    // }

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
}

import { ExpiredTimerEvents } from '@app/constants/expired-timer-events';
import { BAN_PLAYER, NO_MORE_HOST, NO_MORE_PLAYERS } from '@app/constants/match-errors';
import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { HistoryService } from '@app/services/history/history.service';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { HOST_USERNAME } from '@common/constants/match-constants';
import { PlayerState } from '@common/constants/player-states';
import { MatchEvents } from '@common/events/match.events';
import { UserInfo } from '@common/interfaces/user-info';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    // permit more params to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private readonly matchRoomService: MatchRoomService,
        private readonly playerRoomService: PlayerRoomService,
        private readonly matchBackupService: MatchBackupService,
        private readonly histogramService: HistogramService,
        private readonly historyService: HistoryService,
    ) {}

    @SubscribeMessage(MatchEvents.JoinRoom)
    joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: UserInfo) {
        const codeErrors = this.matchRoomService.getRoomCodeErrors(data.roomCode);
        const usernameErrors = this.playerRoomService.getUsernameErrors(data.roomCode, data.username);
        const errorMessage = codeErrors + usernameErrors;
        if (errorMessage) {
            this.sendError(socket.id, errorMessage);
            this.server.in(socket.id).disconnectSockets();
        } else {
            socket.join(data.roomCode);
            const newPlayer = this.playerRoomService.addPlayer(socket, data.roomCode, data.username);
            return { code: data.roomCode, username: newPlayer.username };
        }
    }

    @SubscribeMessage(MatchEvents.CreateRoom)
    createRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; isTestPage: boolean }) {
        const selectedGame: Game = this.matchBackupService.getBackupGame(data.gameId);
        const newMatchRoom: MatchRoom = this.matchRoomService.addRoom(selectedGame, socket, data.isTestPage);
        this.histogramService.resetChoiceTracker(newMatchRoom.code);
        if (data.isTestPage) {
            const playerInfo = { roomCode: newMatchRoom.code, username: HOST_USERNAME };
            socket.join(newMatchRoom.code);

            this.playerRoomService.addPlayer(socket, playerInfo.roomCode, playerInfo.username);

            this.matchRoomService.sendFirstQuestion(this.server, playerInfo.roomCode);

            return { code: newMatchRoom.code };
        }

        socket.join(newMatchRoom.code);
        return { code: newMatchRoom.code };
    }

    @SubscribeMessage(MatchEvents.RouteToResultsPage)
    routeToResultsPage(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        this.playerRoomService.setStateForAll(matchRoomCode, PlayerState.default);
        this.server.to(matchRoomCode).emit(MatchEvents.RouteToResultsPage);
        this.emitHistogramHistory(matchRoomCode);
        this.historyService.createHistoryItem(this.matchRoomService.getRoom(matchRoomCode));
    }

    @SubscribeMessage(MatchEvents.ToggleLock)
    toggleLock(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        this.matchRoomService.toggleLock(matchRoomCode);
    }

    @SubscribeMessage(MatchEvents.BanUsername)
    banUsername(@ConnectedSocket() socket: Socket, @MessageBody() data: UserInfo) {
        this.playerRoomService.addBannedUsername(data.roomCode, data.username);
        const playerToBan = this.playerRoomService.getPlayerByUsername(data.roomCode, data.username);
        if (playerToBan) {
            this.playerRoomService.deletePlayer(data.roomCode, data.username);
            this.sendError(playerToBan.socket.id, BAN_PLAYER);
            this.server.in(playerToBan.socket.id).emit(MatchEvents.KickPlayer);
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

    @SubscribeMessage(MatchEvents.StartMatch)
    startMatch(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.matchRoomService.markGameAsPlaying(roomCode);
        this.matchRoomService.startMatch(socket, this.server, roomCode);
        this.playerRoomService.setStateForAll(roomCode, PlayerState.noInteraction);
    }

    @SubscribeMessage(MatchEvents.NextQuestion)
    nextQuestion(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.playerRoomService.setStateForAll(roomCode, PlayerState.noInteraction);
        this.matchRoomService.startNextQuestionCooldown(this.server, roomCode);
    }

    @OnEvent(ExpiredTimerEvents.CountdownTimerExpired)
    onCountdownTimerExpired(matchRoomCode: string) {
        this.matchRoomService.sendFirstQuestion(this.server, matchRoomCode);
        this.histogramService.sendHistogram(matchRoomCode);
    }

    @OnEvent(ExpiredTimerEvents.CooldownTimerExpired)
    onCooldownTimerExpired(matchRoomCode: string) {
        this.matchRoomService.sendNextQuestion(this.server, matchRoomCode);
        if (!this.isTestRoom(matchRoomCode)) {
            this.histogramService.resetChoiceTracker(matchRoomCode);
            this.histogramService.sendHistogram(matchRoomCode);
        }
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        const hostRoomCode = this.matchRoomService.getRoomCodeByHostSocket(socket.id);
        const hostRoom = this.matchRoomService.getRoom(hostRoomCode);
        // TODO: Improve
        if (hostRoomCode && hostRoom.currentQuestionIndex !== hostRoom.gameLength) {
            this.sendError(hostRoomCode, NO_MORE_HOST);
            this.deleteRoom(hostRoomCode);
            return;
        }
        const roomCode = this.playerRoomService.deletePlayerBySocket(socket.id);
        if (!roomCode) {
            return;
        }
        const room = this.matchRoomService.getRoom(roomCode);
        const isRoomEmpty = this.isRoomEmpty(room);
        if (room.isPlaying && isRoomEmpty && room.currentQuestionIndex !== room.gameLength) {
            this.sendError(roomCode, NO_MORE_PLAYERS);
            this.deleteRoom(roomCode);
            return;
        }
        this.handleSendPlayersData(roomCode);
    }

    deleteRoom(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit(MatchEvents.HostQuitMatch);
        this.server.in(matchRoomCode).disconnectSockets();
        this.matchRoomService.deleteRoom(matchRoomCode);
    }

    handleSendPlayersData(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit(MatchEvents.FetchPlayersData, this.playerRoomService.getPlayersStringified(matchRoomCode));
    }

    sendError(socketId: string, error: string) {
        this.server.to(socketId).emit(MatchEvents.Error, error);
    }

    private emitHistogramHistory(matchRoomCode: string) {
        const histograms = this.histogramService.sendHistogramHistory(matchRoomCode);
        this.server.to(matchRoomCode).emit(MatchEvents.HistogramHistory, histograms);
    }

    private isRoomEmpty(room: MatchRoom) {
        return room.players.every((player) => !player.isPlaying);
    }

    private isTestRoom(matchRoomCode: string) {
        const matchRoom = this.matchRoomService.getRoom(matchRoomCode);
        return matchRoom.hostSocket === matchRoom.players[0].socket;
    }
}

import { TimerEvents } from '@app/constants/timer-events';
import { Game } from '@app/model/database/game';
import { MatchRoom } from '@app/model/schema/match-room.schema';
import { Message } from '@app/model/schema/message.schema';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { MatchEvents } from './match.gateway.events';

import { HistogramService } from '@app/services/histogram/histogram.service';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

interface UserInfo {
    roomCode: string;
    username: string;
}

interface MessageInfo {
    roomCode: string;
    message: Message;
}

// Future TODO: Open socket only if code and user are valid + Allow host to be able to disconnect banned players
@WebSocketGateway({ cors: true })
@Injectable()
export class MatchGateway implements OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    // permit more params to decouple services
    // eslint-disable-next-line max-params
    constructor(
        private matchRoomService: MatchRoomService,
        private playerRoomService: PlayerRoomService,
        private matchBackupService: MatchBackupService,
        private histogramService: HistogramService,
        private chatService: ChatService,
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
    createRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: { gameId: string; isTestPage: boolean }) {
        const selectedGame: Game = this.matchBackupService.getBackupGame(data.gameId);
        const newMatchRoom: MatchRoom = this.matchRoomService.addMatchRoom(selectedGame, socket, data.isTestPage);
        this.histogramService.resetChoiceHistogram(newMatchRoom.code);
        if (data.isTestPage) {
            const playerInfo = { roomCode: newMatchRoom.code, username: 'Organisateur' };
            socket.join(newMatchRoom.code);

            this.playerRoomService.addPlayer(socket, playerInfo.roomCode, playerInfo.username);

            this.matchRoomService.sendFirstQuestion(this.server, playerInfo.roomCode);

            return { code: newMatchRoom.code };
        }

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

    @SubscribeMessage(MatchEvents.RoomMessage)
    handleIncomingRoomMessages(@ConnectedSocket() socket: Socket, @MessageBody() data: MessageInfo) {
        this.chatService.addMessage(data.message, data.roomCode);
        this.sendMessageToClients(data);
    }

    // @SubscribeMessage(MatchEvents.StartTimer)
    // startTimer(@ConnectedSocket() socket: Socket, @MessageBody() data: TimerInfo) {
    //     this.timeService.startTimer(data.roomCode, data.time, this.server);
    // }
    @SubscribeMessage(MatchEvents.SendMessagesHistory)
    sendMessagesHistory(@ConnectedSocket() socket: Socket, @MessageBody() matchRoomCode: string) {
        if (socket.rooms.has(matchRoomCode)) {
            this.handleSentMessagesHistory(matchRoomCode);
        }
    }

    // @SubscribeMessage(MatchEvents.StopTimer)
    // stopTimer(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
    //     this.timeService.stopTimer(roomCode, this.server);
    // }
    // TODO: Start match: Do not forget to make isPlaying = true in MatchRoom object!!
    @SubscribeMessage(MatchEvents.StartMatch)
    startMatch(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.matchRoomService.markGameAsPlaying(roomCode);
        this.matchRoomService.startMatch(socket, this.server, roomCode);
    }

    @SubscribeMessage(MatchEvents.NextQuestion)
    nextQuestion(@ConnectedSocket() socket: Socket, @MessageBody() roomCode: string) {
        this.matchRoomService.startNextQuestionCooldown(this.server, roomCode);
    }

    @OnEvent(TimerEvents.CountdownTimerExpired)
    onCountdownTimerExpired(matchRoomCode: string) {
        this.matchRoomService.sendFirstQuestion(this.server, matchRoomCode);
    }

    @OnEvent(TimerEvents.CooldownTimerExpired)
    onCooldownTimerExpired(matchRoomCode: string) {
        this.matchRoomService.sendNextQuestion(this.server, matchRoomCode);
        this.histogramService.resetChoiceHistogram(matchRoomCode);
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
        const hostRoomCode = this.matchRoomService.getRoomCodeByHostSocket(socket.id);
        if (hostRoomCode) {
            this.deleteMatchRoom(hostRoomCode);
            return;
        }
        const roomCode = this.playerRoomService.deletePlayerBySocket(socket.id);
        if (!roomCode) {
            return;
        }
        const room = this.matchRoomService.getMatchRoomByCode(roomCode);
        const allPlayersQuit = room.players.every((player) => !player.isPlaying);
        if (room.isPlaying && allPlayersQuit) {
            this.deleteMatchRoom(roomCode);
            return;
        }

        this.handleSendPlayersData(roomCode);
    }

    deleteMatchRoom(matchRoomCode: string) {
        this.server.in(matchRoomCode).disconnectSockets();
        this.matchRoomService.deleteMatchRoom(matchRoomCode);
    }

    sendMessageToClients(data: MessageInfo) {
        this.server.to(data.roomCode).emit(MatchEvents.NewMessage, data);
    }

    handleSendPlayersData(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit('fetchPlayersData', this.playerRoomService.getPlayersStringified(matchRoomCode));
    }

    handleSentMessagesHistory(matchRoomCode: string) {
        this.server.to(matchRoomCode).emit('fetchOldMessages', this.chatService.getMessages(matchRoomCode));
    }

    // TODO: Start match: Do not forget to make isPlaying = true in MatchRoom object!!
}

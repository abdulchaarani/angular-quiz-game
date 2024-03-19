/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BAN_PLAYER, NO_MORE_HOST } from '@app/constants/match-errors';
import { HOST_CONFLICT, INVALID_CODE } from '@app/constants/match-login-errors';
import {
    MOCK_MATCH_ROOM,
    MOCK_MESSAGE_INFO,
    MOCK_PLAYER,
    MOCK_PLAYER_ROOM,
    MOCK_ROOM_CODE,
    MOCK_TEST_MATCH_ROOM,
    MOCK_USER_INFO,
} from '@app/constants/match-mocks';
import { TimerEvents } from '@app/constants/timer-events';
import { MatchGateway } from '@app/gateways/match/match.gateway';
import { ChatService } from '@app/services/chat/chat.service';
import { HistogramService } from '@app/services/histogram/histogram.service';
import { MatchBackupService } from '@app/services/match-backup/match-backup.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { PlayerRoomService } from '@app/services/player-room/player-room.service';
import { TimeService } from '@app/services/time/time.service';
import { Histogram } from '@common/interfaces/histogram';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { MatchEvents } from './match.gateway.events';

describe('MatchGateway', () => {
    let gateway: MatchGateway;
    let histogramSpy: SinonStubbedInstance<HistogramService>;
    let matchRoomSpy: SinonStubbedInstance<MatchRoomService>;
    let matchBackupSpy: SinonStubbedInstance<MatchBackupService>;
    let timeSpy: SinonStubbedInstance<TimeService>;
    let chatSpy: SinonStubbedInstance<ChatService>;
    let playerRoomSpy: SinonStubbedInstance<PlayerRoomService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;
    let eventEmitter: EventEmitter2;

    beforeEach(async () => {
        histogramSpy = createStubInstance(HistogramService);
        matchRoomSpy = createStubInstance(MatchRoomService);
        matchBackupSpy = createStubInstance(MatchBackupService);
        timeSpy = createStubInstance(TimeService);
        playerRoomSpy = createStubInstance(PlayerRoomService);
        chatSpy = createStubInstance(ChatService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchGateway,
                { provide: HistogramService, useValue: histogramSpy },
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: MatchBackupService, useValue: matchBackupSpy },
                { provide: TimeService, useValue: timeSpy },
                { provide: PlayerRoomService, useValue: playerRoomSpy },
                { provide: ChatService, useValue: chatSpy },
                EventEmitter2,
            ],
        }).compile();

        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
        gateway = module.get<MatchGateway>(MatchGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    it('joinRoom() should let the player join if the room code and the username are valid', () => {
        matchRoomSpy.getRoomCodeErrors.returns('');
        playerRoomSpy.getUsernameErrors.returns('');
        playerRoomSpy.addPlayer.returns(MOCK_PLAYER);
        const result = gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeTruthy();
        expect(playerRoomSpy.addPlayer.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_USER_INFO.roomCode, username: MOCK_PLAYER.username });
    });

    it('joinRoom() should not let the player join if the room code or the username are invalid', () => {
        matchRoomSpy.getRoomCodeErrors.returns(INVALID_CODE);
        playerRoomSpy.getUsernameErrors.returns(HOST_CONFLICT);
        const sendErrorSpy = jest.spyOn(gateway, 'sendError').mockReturnThis();
        server.in.returns({
            disconnectSockets: () => {
                return null;
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.joinRoom(socket, MOCK_USER_INFO);
        expect(socket.join.calledOnce).toBeFalsy();
        expect(sendErrorSpy).toHaveBeenCalled();
    });

    it('createRoom() should let the host create a match room and let the host join the new room', () => {
        matchRoomSpy.addRoom.returns(MOCK_MATCH_ROOM);
        const result = gateway.createRoom(socket, { gameId: MOCK_MATCH_ROOM.game.id, isTestPage: MOCK_MATCH_ROOM.isTestRoom });
        expect(socket.join.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_MATCH_ROOM.code });
    });

    it('createRoom() should let host create a testing match room and let host join as the only player in the new room', () => {
        matchRoomSpy.addRoom.returns(MOCK_TEST_MATCH_ROOM);
        const result = gateway.createRoom(socket, { gameId: MOCK_TEST_MATCH_ROOM.game.id, isTestPage: MOCK_TEST_MATCH_ROOM.isTestRoom });
        expect(socket.join.calledOnce).toBeTruthy();
        expect(result).toEqual({ code: MOCK_TEST_MATCH_ROOM.code });
    });

    it('routeToResultsPage() should emit a routing event to a room and call emitHistogramHistory', () => {
        const spy = jest.spyOn<any, any>(gateway, 'emitHistogramHistory').mockReturnThis();
        server.to.returns({
            emit: (event: string) => {
                expect(event).toBe('routeToResultsPage');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.routeToResultsPage(socket, MOCK_ROOM_CODE);
        expect(spy).toHaveBeenCalled();
    });

    it('emitHistogramHistory() should emit a list of histograms to a given room', () => {
        const histograms = [] as Histogram[];
        histogramSpy.sendHistogramHistory.returns(histograms);
        server.to.returns({
            emit: (event: string, res) => {
                expect(event).toBe('histogramHistory');
                expect(res).toBe(histograms);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway['emitHistogramHistory'](MOCK_ROOM_CODE);
    });

    it('isRoomEmpty() should return true if room is empty', () => {
        const room = { ...MOCK_PLAYER_ROOM };
        room.players[0].isPlaying = false;
        const result = gateway['isRoomEmpty'](room);
        expect(result).toBe(true);
    });

    it('isRoomEmpty() should return false if room is not empty', () => {
        const room = { ...MOCK_PLAYER_ROOM };
        room.players[0].isPlaying = true;
        const result = gateway['isRoomEmpty'](room);
        expect(result).toBe(false);
    });

    it('toggleLock() should call toggleLock', () => {
        const toggleSpy = jest.spyOn(matchRoomSpy, 'toggleLock').mockReturnThis();
        gateway.toggleLock(socket, '');
        expect(toggleSpy).toHaveBeenCalled();
    });

    it('banUsername() should add username to banned usernames list, and delete player if applicable, then update list', () => {
        const addBannedUsernameSpy = jest.spyOn(playerRoomSpy, 'addBannedUsername').mockReturnThis();
        const mockPlayer = MOCK_PLAYER;
        mockPlayer.socket = socket;
        const errorSpy = jest.spyOn(gateway, 'sendError').mockReturnThis();
        const playerSpy = jest.spyOn(playerRoomSpy, 'getPlayerByUsername').mockReturnValue(mockPlayer);
        const deleteSpy = jest.spyOn(playerRoomSpy, 'deletePlayer').mockReturnThis();
        server.in.returns({
            disconnectSockets: () => {
                return null;
            },
        } as BroadcastOperator<unknown, unknown>);
        const sendSpy = jest.spyOn(gateway, 'sendPlayersData').mockReturnThis();
        gateway.banUsername(socket, MOCK_USER_INFO);
        expect(addBannedUsernameSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(playerSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(deleteSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(sendSpy).toHaveBeenCalledWith(socket, MOCK_USER_INFO.roomCode);
        expect(errorSpy).toHaveBeenCalledWith(mockPlayer.socket.id, BAN_PLAYER);
    });

    it('handleIncomingRoomMessages() should add the received message to the list of messages, and emit a newMessage event', () => {
        const mockMessageInfo = MOCK_MESSAGE_INFO;
        const sendSpy = jest.spyOn(gateway, 'sendMessageToClients').mockReturnThis();
        const addMessageSpy = jest.spyOn(chatSpy, 'addMessage').mockReturnThis();
        gateway.handleIncomingRoomMessages(socket, mockMessageInfo);
        expect(addMessageSpy).toHaveBeenCalledWith(mockMessageInfo.message, mockMessageInfo.roomCode);
        expect(sendSpy).toHaveBeenCalledWith(MOCK_MESSAGE_INFO);
    });

    it('sendMessageToClients() should emit a NewMessage event and send the messages to the players in the right room', () => {
        const toSpy = jest.spyOn(server, 'to').mockReturnValue({
            emit: (event: string, messageInfo) => {
                expect(event).toEqual('newMessage');
                expect(messageInfo).toEqual(MOCK_MESSAGE_INFO);
            },
        } as unknown as BroadcastOperator<DefaultEventsMap, unknown>);
        gateway.sendMessageToClients(MOCK_MESSAGE_INFO);
        expect(toSpy).toHaveBeenCalledWith(MOCK_MESSAGE_INFO.roomCode);
    });

    it('sendMessageToClients() should emit a NewMessage event to the player in the right room', () => {
        const spy = jest.spyOn(gateway, 'sendMessageToClients').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_MESSAGE_INFO.roomCode]));
        gateway.sendMessageToClients(MOCK_MESSAGE_INFO);
        expect(spy).toHaveBeenCalledWith(MOCK_MESSAGE_INFO);
    });

    it('sendMessagesHistory() should call handleSentMessagesHistory if it is in the correct room', () => {
        const mockMatchRoomCode = MOCK_ROOM_CODE;
        const handleSentMessagesHistorySpy = jest.spyOn(gateway, 'handleSentMessagesHistory').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.sendMessagesHistory(socket, mockMatchRoomCode);
        expect(handleSentMessagesHistorySpy).toHaveBeenCalledWith(mockMatchRoomCode);
    });

    it('handleSentMessagesHistory() should emit fetchOldMessages event and get the messages', () => {
        const mockMatchRoomCode = MOCK_MESSAGE_INFO.roomCode;
        const mockMessageInfo = MOCK_MESSAGE_INFO;
        const mockMessages = [mockMessageInfo.message, mockMessageInfo.message];
        const getMessagesSpy = jest.spyOn(chatSpy, 'getMessages').mockReturnValue(mockMessages);

        server.to.returns({
            emit: (event: string, res) => {
                expect(event).toEqual(MatchEvents.FetchOldMessages);
                expect(res).toEqual(mockMessages);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.handleSentMessagesHistory(mockMatchRoomCode);
        expect(getMessagesSpy).toHaveBeenCalledWith(mockMatchRoomCode);
    });

    it('banUsername() should add username to banned usernames list then update list (if player is not found)', () => {
        const addBannedUsernameSpy = jest.spyOn(playerRoomSpy, 'addBannedUsername').mockReturnThis();
        const playerSpy = jest.spyOn(playerRoomSpy, 'getPlayerByUsername').mockReturnValue(undefined);
        const deleteSpy = jest.spyOn(playerRoomSpy, 'deletePlayer').mockReturnThis();
        const sendSpy = jest.spyOn(gateway, 'sendPlayersData').mockReturnThis();
        gateway.banUsername(socket, MOCK_USER_INFO);
        expect(addBannedUsernameSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(playerSpy).toHaveBeenCalledWith(MOCK_USER_INFO.roomCode, MOCK_USER_INFO.username);
        expect(deleteSpy).not.toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith(socket, MOCK_USER_INFO.roomCode);
    });

    it('sendPlayersData() should check if the socket is in the right room and handle the data', () => {
        const spy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.sendPlayersData(socket, MOCK_ROOM_CODE);
        expect(spy).toHaveBeenCalledWith(MOCK_ROOM_CODE);
    });

    it('sendPlayersData() should not handle the data if the socket is not in the right room', () => {
        const spy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        stub(socket, 'rooms').value(new Set([]));
        gateway.sendPlayersData(socket, MOCK_ROOM_CODE);
        expect(spy).not.toHaveBeenCalled();
    });

    it('deleteRoom() should disconnect all sockets and delete the match room', () => {
        const deleteSpy = jest.spyOn(matchRoomSpy, 'deleteRoom').mockReturnThis();
        server.in.returns({
            disconnectSockets: () => {
                return null;
            },
        } as BroadcastOperator<unknown, unknown>);

        server.to.returns({
            emit: (event: string) => {
                expect(event).toEqual(MatchEvents.HostQuitMatch);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.deleteRoom('');
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should disconnect host and all other players and delete the match room if the host disconnects', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(MOCK_ROOM_CODE);
        const errorSpy = jest.spyOn(gateway, 'sendError').mockReturnThis();
        const deleteSpy = jest.spyOn(gateway, 'deleteRoom').mockReturnThis();
        gateway.handleDisconnect(socket);
        expect(deleteSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(MOCK_ROOM_CODE, NO_MORE_HOST);
    });

    it('handleDisconnect() should disconnect the player and update list if a player disconnects', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(undefined);
        playerRoomSpy.deletePlayerBySocket.returns(MOCK_ROOM_CODE);
        matchRoomSpy.getRoom.returns(MOCK_MATCH_ROOM);
        const handleSpy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        gateway.handleDisconnect(socket);
        expect(handleSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should disconnect the player disconnect host as well if there are no more players', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(undefined);
        const mockRoomToDelete = MOCK_MATCH_ROOM;
        mockRoomToDelete.players = [];
        mockRoomToDelete.isPlaying = true;
        playerRoomSpy.deletePlayerBySocket.returns(MOCK_ROOM_CODE);
        matchRoomSpy.getRoom.returns(mockRoomToDelete);
        const errorSpy = jest.spyOn(gateway, 'sendError').mockReturnThis();
        const handleSpy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        const deleteSpy = jest.spyOn(gateway, 'deleteRoom').mockReturnThis();
        gateway.handleDisconnect(socket);
        expect(errorSpy).toHaveBeenCalled();
        expect(handleSpy).not.toHaveBeenCalled();
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('handleDisconnect() should do nothing if there is no corresponding roomCode for the player', () => {
        matchRoomSpy.getRoomCodeByHostSocket.returns(undefined);
        const mockRoomToDelete = MOCK_MATCH_ROOM;
        mockRoomToDelete.players = [];
        mockRoomToDelete.isPlaying = true;
        playerRoomSpy.deletePlayerBySocket.returns(undefined);
        const errorSpy = jest.spyOn(gateway, 'sendError').mockReturnThis();
        const getSpy = jest.spyOn(matchRoomSpy, 'getRoom').mockReturnThis();
        const handleSpy = jest.spyOn(gateway, 'handleSendPlayersData').mockReturnThis();
        const deleteSpy = jest.spyOn(gateway, 'deleteRoom').mockReturnThis();
        gateway.handleDisconnect(socket);
        expect(getSpy).not.toHaveBeenCalled();
        expect(handleSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('handleSendPlayersData() should emit a fetch event to the match room with a list of stringified players', () => {
        const getSpy = jest.spyOn(playerRoomSpy, 'getPlayersStringified').mockReturnValue('mock');
        server.to.returns({
            emit: (event: string, playersStringified: string) => {
                expect(event).toEqual(MatchEvents.FetchPlayersData);
                expect(playersStringified).toEqual('mock');
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.handleSendPlayersData(MOCK_ROOM_CODE);
        expect(getSpy).toHaveBeenCalled();
    });

    it('sendError() should send the error to the socketId', () => {
        server.to.returns({
            emit: (event: string, error: string) => {
                expect(event).toEqual(MatchEvents.Error);
                expect(error).toEqual(INVALID_CODE);
            },
        } as BroadcastOperator<unknown, unknown>);
        gateway.sendError('', INVALID_CODE);
    });

    it('startMatch() should delegate starting match to match room service', () => {
        const markGameSpy = jest.spyOn(matchRoomSpy, 'markGameAsPlaying');
        const startSpy = jest.spyOn(matchRoomSpy, 'startMatch').mockReturnThis();
        gateway.startMatch(socket, MOCK_ROOM_CODE);
        expect(startSpy).toHaveBeenCalledWith(socket, server, MOCK_ROOM_CODE);
        expect(markGameSpy).toHaveBeenCalled();
    });

    it('nextQuestion() should delegate starting next question to match room service', () => {
        const nextSpy = jest.spyOn(matchRoomSpy, 'startNextQuestionCooldown').mockReturnThis();
        stub(socket, 'rooms').value(new Set([MOCK_ROOM_CODE]));
        gateway.nextQuestion(socket, MOCK_ROOM_CODE);
        expect(nextSpy).toHaveBeenCalledWith(server, MOCK_ROOM_CODE);
    });

    it('onCountdownTimerExpired() should call helper functions when CountdownTimerExpired event is emitted', () => {
        const sendFirstQuestionSpy = jest.spyOn(matchRoomSpy, 'sendFirstQuestion');

        eventEmitter.addListener(TimerEvents.CountdownTimerExpired, gateway.onCountdownTimerExpired);
        expect(eventEmitter.hasListeners(TimerEvents.CountdownTimerExpired)).toBe(true);

        server.in.returns({
            emit: (event: string) => {
                expect(event).toEqual('beginQuiz');
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.onCountdownTimerExpired(MOCK_ROOM_CODE);
        expect(sendFirstQuestionSpy).toHaveBeenCalledWith(server, MOCK_ROOM_CODE);

        eventEmitter.removeListener(TimerEvents.CountdownTimerExpired, gateway.onCountdownTimerExpired);
    });

    it('onCooldownTimerExpired() should call helper functions when CooldownTimerExpired event is emitted', () => {
        const sendNextQuestionSpy = jest.spyOn(matchRoomSpy, 'sendNextQuestion');

        eventEmitter.addListener(TimerEvents.CooldownTimerExpired, gateway.onCountdownTimerExpired);
        expect(eventEmitter.hasListeners(TimerEvents.CooldownTimerExpired)).toBe(true);

        gateway.onCooldownTimerExpired(MOCK_ROOM_CODE);
        expect(sendNextQuestionSpy).toHaveBeenCalledWith(server, MOCK_ROOM_CODE);

        eventEmitter.removeListener(TimerEvents.CooldownTimerExpired, gateway.onCountdownTimerExpired);
    });
});

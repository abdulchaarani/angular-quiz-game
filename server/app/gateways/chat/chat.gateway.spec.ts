/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_MESSAGE_INFO, MOCK_ROOM_CODE } from '@app/constants/match-mocks';
import { ChatService } from '@app/services/chat/chat.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance, stub } from 'sinon';
import { BroadcastOperator, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ChatGateway } from './chat.gateway';
import { ChatEvents } from '@common/events/chat.events';

describe('MatchGateway', () => {
    let gateway: ChatGateway;
    let chatSpy: SinonStubbedInstance<ChatService>;
    let socket: SinonStubbedInstance<Socket>;
    let server: SinonStubbedInstance<Server>;

    beforeEach(async () => {
        chatSpy = createStubInstance(ChatService);
        socket = createStubInstance<Socket>(Socket);
        server = createStubInstance<Server>(Server);

        const module: TestingModule = await Test.createTestingModule({
            providers: [ChatGateway, { provide: ChatService, useValue: chatSpy }],
        }).compile();

        gateway = module.get<ChatGateway>(ChatGateway);
        // We want to assign a value to the private field
        // eslint-disable-next-line dot-notation
        gateway['server'] = server;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
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
                expect(event).toEqual(ChatEvents.FetchOldMessages);
                expect(res).toEqual(mockMessages);
            },
        } as BroadcastOperator<unknown, unknown>);

        gateway.handleSentMessagesHistory(mockMatchRoomCode);
        expect(getMessagesSpy).toHaveBeenCalledWith(mockMatchRoomCode);
    });
});

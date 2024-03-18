/* eslint-disable @typescript-eslint/no-explicit-any */

import { TestBed } from '@angular/core/testing';

import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { ChatService } from './chat.service';

import { MOCK_MESSAGE, MOCK_MESSAGES, MOCK_ROOM_CODE } from '@app/constants/chat-mocks';
import SpyObj = jasmine.SpyObj;

describe('ChatService', () => {
    let service: ChatService;
    let socketHandlerSpy: SpyObj<SocketHandlerService>;
    let matchRoomServiceSpy: SpyObj<MatchRoomService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketHandlerService', ['on', 'send', 'isSocketAlive']);
        const matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getRoomCode']);

        matchRoomSpy.messages = [];

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, MatDialogModule],
            providers: [ChatService, { provide: SocketHandlerService, useValue: socketSpy }, { provide: MatchRoomService, useValue: matchRoomSpy }],
        });

        service = TestBed.inject(ChatService);
        socketHandlerSpy = TestBed.inject(SocketHandlerService) as jasmine.SpyObj<SocketHandlerService>;
        matchRoomServiceSpy = TestBed.inject(MatchRoomService) as jasmine.SpyObj<MatchRoomService>;
    });

    const mockMessage = MOCK_MESSAGE;

    const mockMessages = MOCK_MESSAGES;

    const mockRoomCode = MOCK_ROOM_CODE;

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send message', () => {
        service.sendMessage(mockRoomCode, mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should handle newMessage event', () => {
        const sentData = { roomCode: mockRoomCode, message: mockMessage };
        service.handleReceivedMessages();
        socketHandlerSpy.on.calls.mostRecent().args[1](sentData);
        const roomMessages = matchRoomServiceSpy.messages;
        expect(roomMessages).toEqual([mockMessage]);
    });

    it('should send messages history', () => {
        service.sendMessagesHistory(mockRoomCode);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should fetch old messages', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketHandlerSpy.on.and.callFake((event, cb) => cb(mockMessages as any));
        service.fetchOldMessages();
        expect(matchRoomServiceSpy.messages).toEqual(mockMessages);
    });

    it('should display old messages', () => {
        matchRoomServiceSpy.getRoomCode.and.returnValue(mockRoomCode);
        service.displayOldMessages();
        expect(socketHandlerSpy.on).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('sendMessagesHistory', mockRoomCode);
    });

    it('should send message', () => {
        service.sendMessage(mockRoomCode, mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });
});

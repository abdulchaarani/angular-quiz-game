import { TestBed } from '@angular/core/testing';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
import { Message } from '@app/interfaces/message';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChatService } from './chat.service';
import SpyObj = jasmine.SpyObj;

fdescribe('ChatService', () => {
    let service: ChatService;
    let socketHandlerSpy: SpyObj<SocketHandlerService>;
    let matchRoomServiceSpy: SpyObj<MatchRoomService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketHandlerService', ['on', 'send', 'isSocketAlive']);
        const matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getMatchRoomCode']);

        matchRoomSpy.messages = [];

        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, MatDialogModule],
            providers: [ChatService, { provide: SocketHandlerService, useValue: socketSpy }, { provide: MatchRoomService, useValue: matchRoomSpy }],
        });

        service = TestBed.inject(ChatService);
        socketHandlerSpy = TestBed.inject(SocketHandlerService) as jasmine.SpyObj<SocketHandlerService>;
        matchRoomServiceSpy = TestBed.inject(MatchRoomService) as jasmine.SpyObj<MatchRoomService>;
    });
    const mockMessage: Message = {
        text: 'Test Text',
        author: 'User1',
        date: new Date(),
    };

    const mockMessages: Message[] = [
        {
            text: 'Test Text',
            author: 'User1',
            date: new Date(),
        },
    ];

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send message', () => {
        service.sendMessage('1234', mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should handle newMessage event', () => {
        const sentData = { roomCode: '1234', message: mockMessage };

        service.handleReceivedMessages();
        socketHandlerSpy.on.calls.mostRecent().args[1](sentData);
        const roomMessages = matchRoomServiceSpy.messages;
        expect(roomMessages).toEqual([mockMessage]);
    });

    it('should send messages history', () => {
        service.sendMessagesHistory('1234');
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should fetch old messages', () => {
        socketHandlerSpy.on.and.callFake((event, cb) => cb(mockMessages as any));
        service.fetchOldMessages();
        expect(matchRoomServiceSpy.messages).toEqual(mockMessages);
    });

    it('should display old messages', () => {
        const mockRoomCode = '1234';
        matchRoomServiceSpy.getMatchRoomCode.and.returnValue(mockRoomCode);
        service.displayOldMessages();
        expect(socketHandlerSpy.on).toHaveBeenCalled();
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('sendMessagesHistory', mockRoomCode);
    });

    it('should send message', () => {
        service.sendMessage('1234', mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });
});

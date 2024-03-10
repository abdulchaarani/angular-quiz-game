import { TestBed } from '@angular/core/testing';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
import { Message } from '@app/interfaces/message';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChatService } from './chat.service';

fdescribe('ChatService', () => {
    let service: ChatService;
    let socketHandlerSpy: jasmine.SpyObj<SocketHandlerService>;
    let matchRoomServiceSpy: jasmine.SpyObj<MatchRoomService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketHandlerService', ['on', 'send', 'isSocketAlive']);
        const matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername']);

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

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send message', () => {
        service.sendMessage('1234', mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should handle newMessage event', () => {
        const sentData = { roomCode: '1234', message: mockMessage };
        socketHandlerSpy.on.and.callFake((eventName, callback) => {
            if (eventName === 'newMessage') {
                callback(sentData as any);
            }
        });

        service = new ChatService(socketHandlerSpy, matchRoomServiceSpy);
        const roomMessages = service.messages.get(sentData.roomCode);
        console.log(roomMessages);
        expect(roomMessages).toEqual([mockMessage]);
    });

    it('should send a message and handle the response', () => {
        const mockRoomCode = '1234';
        const response = { code: '5678', message: mockMessage };

        matchRoomServiceSpy.getUsername.and.returnValue('Test Author');
        socketHandlerSpy.send.and.callFake((event: string, data: any, callback: (res: any) => void) => {
            callback(response);
        });

        service.sendMessage(mockRoomCode, mockMessage);
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('roomMessage', { roomCode: mockRoomCode, message: mockMessage }, jasmine.any(Function));
        expect(service.getMatchRoomCode()).toBe(response.code);
        expect(service.message).toEqual(response.message);
    });
});

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

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch old messages', () => {
        service.fetchOldMessages();
        expect(socketHandlerSpy.on).toHaveBeenCalled();
    });

    it('should send message', () => {
        const message: Message = {
            text: 'Hello World',
            author: 'Test',
            date: new Date(),
        };
        service.sendMessage('1234', message);
        expect(socketHandlerSpy.send).toHaveBeenCalled();
    });

    it('should handle newMessage event', () => {
        const message: Message = {
            text: 'Test Text',
            author: 'User1',
            date: new Date(),
        };
        const sentData = { roomCode: '1234', message };
        socketHandlerSpy.on.and.callFake((eventName, callback) => {
            if (eventName === 'newMessage') {
                callback(sentData as any);
            }
        });

        service = new ChatService(socketHandlerSpy, matchRoomServiceSpy);
        const roomMessages = service.messages.get(sentData.roomCode);
        expect(roomMessages).toEqual([message]);
    });

    it('connect() should connect the socket if it is not alive', () => {
        socketHandlerSpy.isSocketAlive.and.returnValue(false);
        const fetchSpy = spyOn(service, 'fetchOldMessages');
        service.connect();
        expect(socketHandlerSpy.isSocketAlive).toHaveBeenCalled();
        expect(fetchSpy).toHaveBeenCalled();
    });

    it('should send a message and handle the response', () => {
        const roomCode = '1234';
        const message = { text: 'Test Text', author: 'Test Author', date: new Date() };
        const response = { code: '5678', message: message };

        matchRoomServiceSpy.getUsername.and.returnValue('Test Author');
        socketHandlerSpy.send.and.callFake((event: string, data: any, callback: (res: any) => void) => {
            callback(response);
        });

        service.sendMessage(roomCode, message);
        expect(socketHandlerSpy.send).toHaveBeenCalledWith('roomMessage', { roomCode, message }, jasmine.any(Function));
        expect(service.getMatchRoomCode()).toBe(response.code);
        expect(service.message).toEqual(response.message);
    });

    it('should fetch and store old messages', () => {
        const mockMessages: Message[] = [
            { text: 'Test Message 1', author: 'User1', date: new Date() },
            { text: 'Test Message 2', author: 'User2', date: new Date() },
        ];

        socketHandlerSpy.on.and.callFake((eventName, callback) => {
            if (eventName === 'fetchOldMessages') {
                callback(mockMessages as any); // eslint not a hug fan of this :)
            }
        });

        const result = service.fetchOldMessages();
        expect(socketHandlerSpy.on).toHaveBeenCalledWith('fetchOldMessages', jasmine.any(Function));
        expect(service.messages.get(service.getMatchRoomCode())).toEqual(mockMessages);
        expect(result).toEqual(mockMessages);
    });
});

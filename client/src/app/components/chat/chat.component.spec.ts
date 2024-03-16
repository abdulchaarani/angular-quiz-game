import { ChatComponent } from './chat.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { ChatService } from '@app/services/chat/chat.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';

import { MOCK_MESSAGE, MOCK_ROOM_CODE, MOCK_DATE } from '@app/constants/chat-mocks';
import SpyObj = jasmine.SpyObj;

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let matchRoomServiceSpy: SpyObj<MatchRoomService>;
    let chatServiceSpy: SpyObj<ChatService>;

    beforeEach(() => {
        const matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername', 'getMatchRoomCode']);
        const socketHandlerSpy = jasmine.createSpyObj('SocketHandlerService', ['send']);
        const chatSpy = jasmine.createSpyObj('ChatService', ['displayOldMessages', 'sendMessage', 'handleReceivedMessages']);
        socketHandlerSpy.socket = jasmine.createSpyObj('socket', ['removeListener']);
        chatSpy.socketHandler = socketHandlerSpy;

        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [MatIconModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule, MatSnackBarModule, MatDialogModule],
            providers: [
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: ChatService, useValue: chatSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        matchRoomServiceSpy = TestBed.inject(MatchRoomService) as jasmine.SpyObj<MatchRoomService>;
        chatServiceSpy = TestBed.inject(ChatService) as jasmine.SpyObj<ChatService>;
        fixture.detectChanges();
    });

    beforeAll(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(MOCK_DATE);
    });

    afterAll(() => {
        jasmine.clock().uninstall();
    });

    const mockMessage = MOCK_MESSAGE;
    const mockRoomCode = MOCK_ROOM_CODE;

    it('should create', () => {
        expect(true).toBeTruthy();
    });

    it('should display old messages on init', () => {
        component.ngOnInit();
        expect(chatServiceSpy.displayOldMessages).toHaveBeenCalled();
    });

    it('should call the even listener handleReceivedMessages() on init', () => {
        component.ngOnInit();
        expect(chatServiceSpy.handleReceivedMessages).toHaveBeenCalled();
    });

    it('should send message', () => {
        matchRoomServiceSpy.getUsername.and.returnValue(mockMessage.author);
        matchRoomServiceSpy.getMatchRoomCode.and.returnValue(mockRoomCode);
        component.sendMessage(mockMessage.text);
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith(mockRoomCode, mockMessage);
    });

    it('should not send an empty message', () => {
        const messageText = '';
        component.sendMessage(messageText);
        expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('should destroy the handleReceivedMessages() and the fetchOldMessages() emits', () => {
        component.ngOnDestroy();
        expect(chatServiceSpy.socketHandler.socket.removeListener).toHaveBeenCalledWith('newMessage');
        expect(chatServiceSpy.socketHandler.socket.removeListener).toHaveBeenCalledWith('fetchOldMessages');
    });
});

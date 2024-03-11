import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatComponent } from './chat.component';
import { ChatService } from '@app/services/chat/chat.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import SpyObj = jasmine.SpyObj;

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let matchRoomServiceSpy: SpyObj<MatchRoomService>;
    let chatServiceSpy: SpyObj<ChatService>;

    beforeEach(() => {
        const matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername', 'getMatchRoomCode']);
        const chatSpy = jasmine.createSpyObj('ChatService', ['displayOldMessages', 'sendMessage']);

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

    const MOCK_DATE = new Date(2024, 1, 1);

    beforeAll(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(MOCK_DATE);
    });

    afterAll(() => {
        jasmine.clock().uninstall();
    });

    const mockMessage = {
        text: 'Test Message',
        author: 'User1',
        date: MOCK_DATE,
    };

    it('should create', () => {
        expect(true).toBeTruthy();
    });

    it('should display old messages on init', () => {
        component.ngOnInit();
        expect(chatServiceSpy.displayOldMessages).toHaveBeenCalled();
    });

    it('should send message', () => {
        matchRoomServiceSpy.getUsername.and.returnValue('User1');
        matchRoomServiceSpy.getMatchRoomCode.and.returnValue('1234');
        component.sendMessage(mockMessage.text);
        expect(chatServiceSpy.sendMessage).toHaveBeenCalledWith('1234', mockMessage);
    });

    it('should not send an empty message', () => {
        const messageText = '';
        component.sendMessage(messageText);
        expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
    });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatComponent } from './chat.component';
import { ChatService } from '@app/services/chat/chat.service';

fdescribe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let chatService: ChatService;

    beforeEach(() => {
        const chatServiceSpy = jasmine.createSpyObj('ChatService', ['sendMessage']);
        chatServiceSpy.messages = jasmine.createSpyObj('messages', ['get']);
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [MatIconModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule, MatSnackBarModule, MatDialogModule],
            providers: [{ provide: ChatService, useValue: chatServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        chatService = TestBed.inject(ChatService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send a message', () => {
        const messageText = 'Test Message';
        component.sendMessage(messageText);
        expect(chatService.sendMessage).toHaveBeenCalled();
    });

    it('should not send an empty message', () => {
        const messageText = '';
        component.sendMessage(messageText);
        expect(chatService.sendMessage).not.toHaveBeenCalled();
    });
});

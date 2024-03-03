import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;
    let matchRoomSpy: jasmine.SpyObj<MatchRoomService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getUsername']); // TODO: Add methods
        TestBed.configureTestingModule({
            declarations: [ChatComponent],
            imports: [MatIconModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule],
            providers: [{ provide: MatchRoomService, useValue: matchRoomSpy }],
        });
        fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

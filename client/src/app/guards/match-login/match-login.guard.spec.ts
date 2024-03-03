import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { matchLoginGuard } from './match-login.guard';
import SpyObj = jasmine.SpyObj;

describe('matchLoginGuard', () => {
    let matchRoomSpy: SpyObj<MatchRoomService>;
    let routerSpy: SpyObj<Router>;
    let notificationSpy: SpyObj<NotificationService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getMatchRoomCode', 'getUsername']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        notificationSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: Router, useValue: routerSpy },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });
    });

    it('should be created', () => {
        expect(matchLoginGuard).toBeTruthy();
    });
});

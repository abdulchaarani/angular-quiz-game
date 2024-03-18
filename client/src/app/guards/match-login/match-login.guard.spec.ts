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
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['getRoomCode', 'getUsername']);
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

    it('should redirect to home page if match room code or username are empty', () => {
        matchRoomSpy.getRoomCode.and.returnValue('');
        matchRoomSpy.getUsername.and.returnValue('');
        TestBed.runInInjectionContext(matchLoginGuard);
        expect(routerSpy.navigateByUrl).toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
    });
    it('should not redirect to home page if room code and username are defined', () => {
        matchRoomSpy.getRoomCode.and.returnValue('mock');
        matchRoomSpy.getUsername.and.returnValue('mock');
        TestBed.runInInjectionContext(matchLoginGuard);
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).not.toHaveBeenCalled();
    });
});

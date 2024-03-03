import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NotificationService } from '../notification/notification.service';
import { SocketHandlerService } from '../socket-handler/socket-handler.service';
import { MatchRoomService } from './match-room.service';
import SpyObj = jasmine.SpyObj;

describe('MatchRoomService', () => {
    let service: MatchRoomService;
    let socketService: SpyObj<SocketHandlerService>;
    let router: SpyObj<Router>;
    let notificationService: SpyObj<NotificationService>;

    beforeEach(() => {
        // TODO: Add methods in spy objs
        socketService = jasmine.createSpyObj('SocketHandlerService', ['']);
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        notificationService = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketHandlerService, useValue: socketService },
                { provide: Router, useValue: router },
                { provide: NotificationService, useValue: notificationService },
            ],
        });
        service = TestBed.inject(MatchRoomService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

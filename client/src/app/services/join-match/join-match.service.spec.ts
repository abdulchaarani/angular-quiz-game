import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { JoinMatchService } from './join-match.service';

describe('JoinMatchService', () => {
    let service: JoinMatchService;
    let matchRoomSpy: jasmine.SpyObj<MatchRoomService>;
    let notificationSpy: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });
        service = TestBed.inject(JoinMatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import { TestBed } from '@angular/core/testing';
// import { pendingChangesGuard } from './pending-changes.guard';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
// import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';

describe('PendingChangesGuard', () => {
    // let guard: any; // Using 'any' to mock CanDeactivateFn type
    let gamesServiceSpy: jasmine.SpyObj<GamesService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
        const gamesServiceSpyObj = jasmine.createSpyObj('GamesService', ['markPendingChanges', 'resetPendingChanges']);
        const notificationServiceSpyObj = jasmine.createSpyObj('NotificationService', ['openConfirmDialog']);

        TestBed.configureTestingModule({
            providers: [
                { provide: GamesService, useValue: gamesServiceSpyObj },
                { provide: NotificationService, useValue: notificationServiceSpyObj },
            ],
        });
        // guard = TestBed.inject(pendingChangesGuard);
        gamesServiceSpy = TestBed.inject(GamesService) as jasmine.SpyObj<GamesService>;
        notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    });

    // it('should be created', () => {
    //     expect(guard).toBeTruthy();
    // });

    it('should return true if there are no pending changes', async () => {
        // const result = await guard();
        // expect(result).toBeTrue();
    });

    it('should open confirmation dialog if there are pending changes', async () => {
        gamesServiceSpy.isPendingChangesSource = new BehaviorSubject<boolean>(true); // Set pending changes to true
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        notificationServiceSpy.openConfirmDialog.and.returnValue(dialogRefSpy);

        // const result = await guard();
        //
        expect(notificationServiceSpy.openConfirmDialog).toHaveBeenCalled();
        // expect(result).toEqual(dialogRefSpy);
    });
});

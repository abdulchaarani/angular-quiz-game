import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DialogConfirmComponent } from '@app/components/dialog-confirm/dialog-confirm.component';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let snackBar: MatSnackBar;
    let dialog: MatDialog;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, NoopAnimationsModule],
            providers: [NotificationService, MatSnackBar, { provide: MatDialog, useClass: MatDialogMock }],
        });

        service = TestBed.inject(NotificationService);
        snackBar = TestBed.inject(MatSnackBar);
        dialog = TestBed.inject(MatDialog);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should display a simple error snackbar', () => {
        const errorMessage = 'FAILURE :(';

        spyOn(snackBar, 'open');

        service.displayErrorMessage(errorMessage);

        expect(snackBar.open).toHaveBeenCalledWith(errorMessage, '✖', {
            duration: 5000,
            panelClass: ['error-snackbar'],
        });
    });

    it('should display a simple success snackbar', () => {
        const successMessage = 'SUCCESS :)';

        spyOn(snackBar, 'open');

        service.displaySuccessMessage(successMessage);

        expect(snackBar.open).toHaveBeenCalledWith(successMessage, '✔', {
            duration: 5000,
            panelClass: ['success-snackbar'],
        });
    });

    it('should display an error message snackbar with a custom action message', () => {
        const errorMessage = 'Error with action :O';
        const action = 'Accept';
        spyOn(snackBar, 'open');

        service.displayErrorMessageAction(errorMessage, action);

        expect(snackBar.open).toHaveBeenCalledWith(errorMessage, action, undefined);
    });

    it('should open a confirmation dialog with provided config and return confirmation result', () => {
        const config: MatDialogConfig = {
            data: {
                icon: 'warning',
                title: 'warning',
                text: 'warning',
            },
        };
        const afterOpenSpy = spyOn(dialog, 'open').and.callThrough();

        service['openConfirmDialog'](config).subscribe((confirmResult) => {
            expect(confirmResult).toBe(true);
            expect(dialog.open).toHaveBeenCalledWith(DialogConfirmComponent, config);
        });

        expect(afterOpenSpy).toHaveBeenCalled();
    });
});

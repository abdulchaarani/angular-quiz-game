import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let snackBar: MatSnackBar;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, NoopAnimationsModule],
            providers: [NotificationService, MatSnackBar],
        });

        service = TestBed.inject(NotificationService);
        snackBar = TestBed.inject(MatSnackBar);
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
});

import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DialogConfirmComponent, DialogData } from '@app/components/dialog-confirm/dialog-confirm.component';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(
        private snackBar: MatSnackBar,
        public dialog: MatDialog,
    ) {}

    displayErrorMessage(errorMessage: string): MatSnackBarRef<TextOnlySnackBar> {
        return this.openSnackBar(errorMessage, '✖', {
            duration: 5000,
            panelClass: ['error-snackbar'],
        });
    }

    displaySuccessMessage(successMessage: string): MatSnackBarRef<TextOnlySnackBar> {
        return this.openSnackBar(successMessage, '✔', {
            duration: 5000,
            panelClass: ['success-snackbar'],
        });
    }

    displayErrorMessageAction(errorMessage: string, action: string): MatSnackBarRef<TextOnlySnackBar> {
        return this.openSnackBar(errorMessage, action);
    }

    openConfirmDialog(config: MatDialogConfig<DialogData>): Observable<boolean> {
        const dialogRef = this.dialog.open(DialogConfirmComponent, config);

        return dialogRef.afterClosed().pipe((confirm) => confirm);
    }

    private openSnackBar(message: string, action: string, options?: MatSnackBarConfig): MatSnackBarRef<TextOnlySnackBar> {
        return this.snackBar.open(message, action, options);
    }
}

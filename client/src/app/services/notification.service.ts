import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { DialogConfirmComponent, DialogData } from '@app/components/dialog-confirm/dialog-confirm.component';
import { QuestionManagementState } from '@app/constants/states';
import { CreateQuestionComponent, DialogManagement } from '@app/pages/create-question/create-question.component';
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

    openPendingChangesConfirmDialog(): Observable<boolean> {
        const pendingChangesConfig: MatDialogConfig<DialogData> = {
            data: {
                icon: 'warning',
                title: 'Attention',
                text: 'Vous avec des modifications non sauvegardés. Êtes-vous certain de vouloir quitter?',
            },
        };
        return this.openConfirmDialog(pendingChangesConfig);
    }

    openCreateQuestionModal(modificationState: QuestionManagementState) {
        const manageConfig: MatDialogConfig<DialogManagement> = {
            data: {
                modificationState,
            },
            height: '70%',
            width: '100%',
        };
        return this.dialog.open(CreateQuestionComponent, manageConfig);
    }

    confirmBankUpload(questionTitle: string) {
        const bankUploadConfig: MatDialogConfig<DialogData> = {
            data: {
                icon: 'info_outline',
                title: 'Êtes-vous certain de vouloir ajouter cette question à la banque de questions?',
                text: questionTitle,
            },
        };
        return this.openConfirmDialog(bankUploadConfig);
    }

    private openSnackBar(message: string, action: string, options?: MatSnackBarConfig): MatSnackBarRef<TextOnlySnackBar> {
        return this.snackBar.open(message, action, options);
    }

    private openConfirmDialog(config: MatDialogConfig<DialogData>): Observable<boolean> {
        const dialogRef = this.dialog.open(DialogConfirmComponent, config);
        return dialogRef.afterClosed().pipe((confirm) => confirm);
    }
}

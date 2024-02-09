import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminQuestionsListComponent } from '@app/pages/admin-page/admin-questions-list/admin-questions-list.component';

export interface DialogData {
    text: string;
}

@Component({
    selector: 'app-dialog-confirm',
    templateUrl: './dialog-confirm.component.html',
    styleUrls: ['./dialog-confirm.component.scss'],
})
export class DialogConfirmComponent {
    constructor(
        public dialogRef: MatDialogRef<AdminQuestionsListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}

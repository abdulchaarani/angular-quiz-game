import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminPageComponent } from '@app/pages/admin-page/admin-main-page/admin-page.component';

@Component({
    selector: 'app-dialog-rename-game',
    templateUrl: './dialog-rename-game.component.html',
    styleUrls: ['./dialog-rename-game.component.scss'],
})
export class DialogRenameGameComponent {
    constructor(
        private dialogRef: MatDialogRef<AdminPageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: string,
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}

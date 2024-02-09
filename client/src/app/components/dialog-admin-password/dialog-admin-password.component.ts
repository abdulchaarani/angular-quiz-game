import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomePageComponent } from '../../pages/home-page/home-page.component';

export interface DialogData {
    username: string;
    password: string;
}

@Component({
    selector: 'app-dialog-admin-password',
    templateUrl: './dialog-admin-password.component.html',
    styleUrls: ['./dialog-admin-password.component.scss'],
})
export class DialogAdminPasswordComponent {
    public isHiddenPassword: boolean;
    constructor(
        public dialogRef: MatDialogRef<HomePageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {
        this.isHiddenPassword = true;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

import { Component, HostListener, Inject } from '@angular/core';
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
        private dialogRef: MatDialogRef<HomePageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {
        this.isHiddenPassword = true;
    }

    @HostListener('window:keyup.Enter', ['$event'])
    onEnterPress(): void {
        this.dialogRef.close(this.data.password);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

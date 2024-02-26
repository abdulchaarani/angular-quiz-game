import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { DialogData } from '../dialog-confirm/dialog-confirm.component';

@Component({
    selector: 'app-dialog-join-match',
    templateUrl: './dialog-join-match.component.html',
    styleUrls: ['./dialog-join-match.component.scss'],
})
export class DialogJoinMatchComponent {
    constructor(
        private dialogRef: MatDialogRef<HomePageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    @HostListener('window:keyup.Enter', ['$event'])
    onEnterPress(): void {
        this.dialogRef.close(this.data.code);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

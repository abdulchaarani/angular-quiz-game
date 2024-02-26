import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';

export interface DialogJoinData {
    code: string;
}
@Component({
    selector: 'app-dialog-join-match',
    templateUrl: './dialog-join-match.component.html',
    styleUrls: ['./dialog-join-match.component.scss'],
})
export class DialogJoinMatchComponent {
    constructor(
        private dialogRef: MatDialogRef<HomePageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogJoinData,
    ) {}

    @HostListener('window:keyup.Enter', ['$event'])
    onEnterPress(): void {
        this.dialogRef.close(this.data.code);
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

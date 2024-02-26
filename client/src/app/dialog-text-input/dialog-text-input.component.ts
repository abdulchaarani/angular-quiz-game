import { Component, HostListener, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

// TODO: Tests (inspiration --> admin)
export interface DialogData {
    input: string;
    title: string;
    placeholder: string;
}

@Component({
    selector: 'app-dialog-text-input',
    templateUrl: './dialog-text-input.component.html',
    styleUrls: ['./dialog-text-input.component.scss'],
})
export class DialogTextInputComponent {
    constructor(
        private dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    @HostListener('window:keyup.Enter', ['$event'])
    onEnterPress(): void {
        this.dialogRef.close(this.data.input);
    }

    onNoClick(): void {
        this.dialogRef.close(null);
    }
}

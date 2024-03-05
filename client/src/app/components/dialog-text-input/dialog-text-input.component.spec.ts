import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTextInputComponent } from './dialog-text-input.component';

describe('DialogTextInputComponent', () => {
    let component: DialogTextInputComponent;
    let fixture: ComponentFixture<DialogTextInputComponent>;
    const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogTextInputComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: matDialogSpy,
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
        });
        fixture = TestBed.createComponent(DialogTextInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when on enter press', () => {
        component.onEnterPress();
        expect(matDialogSpy.close).toHaveBeenCalled();
    });

    it('should close the dialog on no click', () => {
        component.onNoClick();
        expect(matDialogSpy.close).toHaveBeenCalledWith(null);
    });
});

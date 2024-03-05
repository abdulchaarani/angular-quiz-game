import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogTextInputComponent } from './dialog-text-input.component';

@Component({
    selector: 'app-dialog-text-input',
    template: '',
})
class MockDialogTextInputComponent {}

@Component({
    selector: 'mat-form-field',
    template: '',
})
class MockMatFormFieldComponent {}

@Component({
    selector: 'mat-label',
    template: '',
})
class MockMatLabelComponent {}

fdescribe('DialogTextInputComponent', () => {
    let component: DialogTextInputComponent;
    let fixture: ComponentFixture<DialogTextInputComponent>;
    const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogTextInputComponent, MockDialogTextInputComponent, MockMatFormFieldComponent, MockMatLabelComponent],
            imports: [FormsModule, MatDialogModule],
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

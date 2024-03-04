import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogTextInputComponent } from './dialog-text-input.component';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';

describe('DialogTextInputComponent', () => {
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
        }).compileComponents();
        fixture = TestBed.createComponent(DialogTextInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

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

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

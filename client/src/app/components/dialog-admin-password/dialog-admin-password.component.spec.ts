import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogAdminPasswordComponent } from './dialog-admin-password.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('DialogAdminPasswordComponent', () => {
    let component: DialogAdminPasswordComponent;
    let fixture: ComponentFixture<DialogAdminPasswordComponent>;
    const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, FormsModule, MatIconModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule],
            declarations: [DialogAdminPasswordComponent],
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
        fixture = TestBed.createComponent(DialogAdminPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onNoClick() should close the dialog component', () => {
        component.onNoClick();
        expect(matDialogSpy.close).toHaveBeenCalled();
    });

    it('should submit password on Keyboard Enter', () => {
        const eventData: KeyboardEventInit = { key: 'Enter' };
        const keyboardEvent = new KeyboardEvent('keyup', eventData);
        window.dispatchEvent(keyboardEvent);
        expect(matDialogSpy.close).toHaveBeenCalled();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogAdminPasswordComponent } from './dialog-admin-password.component';

describe('DialogAdminPasswordComponent', () => {
    let component: DialogAdminPasswordComponent;
    let fixture: ComponentFixture<DialogAdminPasswordComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DialogAdminPasswordComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
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
});

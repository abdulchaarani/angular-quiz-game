import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogConfirmComponent } from './dialog-confirm.component';

fdescribe('DialogConfrimComponent', () => {
    let component: DialogConfirmComponent;
    let fixture: ComponentFixture<DialogConfirmComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DialogConfirmComponent],
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
        fixture = TestBed.createComponent(DialogConfirmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

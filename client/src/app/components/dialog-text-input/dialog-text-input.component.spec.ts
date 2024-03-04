import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogTextInputComponent } from './dialog-text-input.component';
//import { MatFormFieldModule } from '@angular/material/form-field';

describe('DialogTextInputComponent', () => {
    let component: DialogTextInputComponent;
    let fixture: ComponentFixture<DialogTextInputComponent>;
    const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogTextInputComponent],
          //  imports: [MatFormFieldModule],
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

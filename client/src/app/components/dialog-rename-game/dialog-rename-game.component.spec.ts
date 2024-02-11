import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogRenameGameComponent } from './dialog-rename-game.component';

describe('DialogRenameGameComponent', () => {
    let component: DialogRenameGameComponent;
    let fixture: ComponentFixture<DialogRenameGameComponent>;
    const matDialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DialogRenameGameComponent],
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
        fixture = TestBed.createComponent(DialogRenameGameComponent);
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
});

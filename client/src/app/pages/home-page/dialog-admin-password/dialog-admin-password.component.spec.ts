import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAdminPasswordComponent } from './dialog-admin-password.component';

describe('DialogAdminPasswordComponent', () => {
  let component: DialogAdminPasswordComponent;
  let fixture: ComponentFixture<DialogAdminPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogAdminPasswordComponent]
    });
    fixture = TestBed.createComponent(DialogAdminPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

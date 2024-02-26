import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogTextInputComponent } from './dialog-text-input.component';

describe('DialogTextInputComponent', () => {
  let component: DialogTextInputComponent;
  let fixture: ComponentFixture<DialogTextInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogTextInputComponent]
    });
    fixture = TestBed.createComponent(DialogTextInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

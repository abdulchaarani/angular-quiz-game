import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogJoinMatchComponent } from './dialog-join-match.component';

describe('DialogJoinMatchComponent', () => {
  let component: DialogJoinMatchComponent;
  let fixture: ComponentFixture<DialogJoinMatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogJoinMatchComponent]
    });
    fixture = TestBed.createComponent(DialogJoinMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

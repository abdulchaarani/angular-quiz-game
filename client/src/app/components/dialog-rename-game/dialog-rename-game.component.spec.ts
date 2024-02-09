import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRenameGameComponent } from './dialog-rename-game.component';

describe('DialogRenameGameComponent', () => {
  let component: DialogRenameGameComponent;
  let fixture: ComponentFixture<DialogRenameGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DialogRenameGameComponent]
    });
    fixture = TestBed.createComponent(DialogRenameGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

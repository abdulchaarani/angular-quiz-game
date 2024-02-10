import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminModifyGameComponent } from './admin-modify-game.component';

describe('AdminModifyGameComponent', () => {
  let component: AdminModifyGameComponent;
  let fixture: ComponentFixture<AdminModifyGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminModifyGameComponent]
    });
    fixture = TestBed.createComponent(AdminModifyGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeAnswerAreaComponent } from './free-answer-area.component';

describe('FreeAnswerAreaComponent', () => {
  let component: FreeAnswerAreaComponent;
  let fixture: ComponentFixture<FreeAnswerAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FreeAnswerAreaComponent]
    });
    fixture = TestBed.createComponent(FreeAnswerAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

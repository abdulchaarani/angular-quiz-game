import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HostQuestionAreaComponent } from './host-question-area.component';

describe('HostQuestionAreaComponent', () => {
  let component: HostQuestionAreaComponent;
  let fixture: ComponentFixture<HostQuestionAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostQuestionAreaComponent]
    });
    fixture = TestBed.createComponent(HostQuestionAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

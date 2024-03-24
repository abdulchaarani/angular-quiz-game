import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleChoiceAreaComponent } from './multiple-choice-area.component';

describe('MultipleChoiceAreaComponent', () => {
  let component: MultipleChoiceAreaComponent;
  let fixture: ComponentFixture<MultipleChoiceAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultipleChoiceAreaComponent]
    });
    fixture = TestBed.createComponent(MultipleChoiceAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

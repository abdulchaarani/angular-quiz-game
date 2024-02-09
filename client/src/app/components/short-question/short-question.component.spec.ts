import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortQuestionComponent } from './short-question.component';

describe('ShortQuestionComponent', () => {
  let component: ShortQuestionComponent;
  let fixture: ComponentFixture<ShortQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShortQuestionComponent]
    });
    fixture = TestBed.createComponent(ShortQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerQuestionComponent } from './player-question.component';

describe('PlayerQuestionComponent', () => {
  let component: PlayerQuestionComponent;
  let fixture: ComponentFixture<PlayerQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerQuestionComponent]
    });
    fixture = TestBed.createComponent(PlayerQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

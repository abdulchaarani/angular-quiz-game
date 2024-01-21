import { Component } from '@angular/core';
// import { TimeService } from '@app/services/time.service';
// import { Question } from '@app/interfaces/question';
import { Choice } from '@app/interfaces/choice';

@Component({
  selector: 'app-question-area',
  templateUrl: './question-area.component.html',
  styleUrls: ['./question-area.component.scss']
})
export class QuestionAreaComponent {
  // constructor( private timer : TimeService){}

  currentQuestionIndex : number;
  playerScore          : number;
  questions            : Choice[];
  // TODO : Timer

  submit() : void {}
  checkAnswers() : void {}
  abandon() : void {}


}

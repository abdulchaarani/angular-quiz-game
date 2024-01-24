import { Component, HostListener} from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { Question } from '@app/interfaces/question';

import {
    FormControl,
    Validators,
  } from '@angular/forms';


@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent {
    questionFormControl = new FormControl('', [Validators.required]);

    timer = 5;
    constructor(readonly timeService: TimeService) {}
    choiceColors: string[] = ['#ff9999', '#99ff99', '#9999ff', '#ffff99'];
    bottomBordersColour: string[] = ['#ff999', '#99ff9', '#999ff', '#ffff9'];

    get time(): number {
        return this.timeService.time;
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        //this.buttonPressed = event.key;
    }

    // TODO : déplacer ceci dans un service de gestion de la souris!
    mouseHitDetect(event: MouseEvent) {
        this.timeService.startTimer(this.timer);
    }

    disabled = false;
    max = 100;
    min = 0;
    showTicks = false;
    step = 1;
    thumbLabel = false;
    value = 0;

    question: Question = {
        type: 'QCM',
        description: 'Soccer ball shapes',
        question: '',
        points: 20,
        choices: [
            {
                choice: '',
                isCorrect: true,
            },
            {
                choice: '',
                isCorrect: true,
            },
            {
                choice: '',
                isCorrect: false,
            },
        ],
        lastModification: '2018-11-13T20:20:39+00:00',
    };
    addChoice() {
        this.question.choices?.push({ choice: '', isCorrect: false });
        //this.question.choices.push({ choice: '', isCorrect: false });
    }

    removeChoice(index: number) {
        this.question.choices?.splice(index, 1);
    }

    duplicateQuestion() {
      const duplicatedQuestion: Question = { ...this.question }; 
      duplicatedQuestion.choices = duplicatedQuestion.choices.map(choice => ({ ...choice })); 
      this.addChoice(); 
      this.question.push(duplicatedQuestion); 
  }
}

import { Component, HostListener} from '@angular/core';
import { TimeService } from '@app/services/time.service';
import { Question } from '@app/interfaces/question';

import {
    FormControl,
    Validators,
    FormBuilder,
    FormGroup
  } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})

export class CreateQuestionComponent {
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    timer = 5;
    
    constructor(readonly timeService: TimeService, private snackBar: MatSnackBar, private fb: FormBuilder) {
       this.questionForm = this.fb.group({
        questionFormControl: ['', Validators.required],
        description: '',
        points: 0,
        choices: this.fb.array([
          { choice: '', isCorrect: true },
          { choice: '', isCorrect: true },
        ]),
      });
    }
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
    CHOICES_MAX = 4; 
    CHOICES_MIN = 2; 
    max = 100;
    min = 0;
    showTicks = false;
    step = 1;
    thumbLabel = false;
    value = 0;

    question: Question = {
        type: 'QCM',
        description: '',
        question: '',
        points: 0,
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
      if (this.question.choices && this.question.choices?.length < this.CHOICES_MAX ) {
        this.question.choices?.push({ choice: '', isCorrect: false });
      } else{
        this.openSnackBar('4 choix est le maximum',2000);
        return;
      }
        //this.question.choices.push({ choice: '', isCorrect: false });
    }

    removeChoice(index: number) {
      if(this.question.choices && this.CHOICES_MIN < this.question.choices?.length)
        this.question.choices?.splice(index, 1);
      else{
        this.openSnackBar('2 choix est le minimum', 2000)
        return;
      }
    }


    submitForm() {
      if (this.questionForm.valid) {
        //this.saveQuestion();  
        this.openSnackBar('Question saved',2000);
        this.resetForm();
      } else {
        this.openSnackBar('Please fill in all required fields.',2000);
      }
    }

    resetForm() {
      this.questionForm.reset({
        questionFormControl: '',
        description: '',
        points: 0,
        choices: [
          { choice: '', isCorrect: true },
          { choice: '', isCorrect: true },
        ],
      });
    }
  
    openSnackBar(message: string, duration:number=0) {
      this.snackBar.open(message, undefined, {
        duration: duration,
    });
    }

  //   duplicateQuestion() {
  //     const duplicatedQuestion: Question = { ...this.question }; 
  //     duplicatedQuestion.choices = duplicatedQuestion.choices.map(choice => ({ ...choice })); 
  //     this.addChoice(); 
  //     this.question.push(duplicatedQuestion); 
  // }
}

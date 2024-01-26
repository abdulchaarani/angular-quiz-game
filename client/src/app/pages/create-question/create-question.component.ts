import { Component } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent {
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    // choiceColors: string[] = ['#ff9999', '#99ff99', '#9999ff', '#ffff99'];
    // bottomBordersColour: string[] = ['#ff999', '#99ff9', '#999ff', '#ffff9'];

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
    private readonly snackBarDisplayTime = 2000;
    private readonly minChoices = 2;
    private readonly maxChoices = 4;

    constructor(
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
    ) {
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

    addChoice() {
        if (this.question.choices && this.question.choices?.length < this.maxChoices) {
            this.question.choices?.push({ choice: '', isCorrect: false });
        } else {
            this.openSnackBar('4 choix est le maximum', this.snackBarDisplayTime);
            return;
        }
    }

    removeChoice(index: number) {
        if (this.question.choices && this.minChoices < this.question.choices?.length) this.question.choices?.splice(index, 1);
        else {
            this.openSnackBar('2 choix est le minimum', this.snackBarDisplayTime);
            return;
        }
    }

    submitForm() {
        if (this.questionForm.valid) {
            // this.saveQuestion();
            this.openSnackBar('Question saved', this.snackBarDisplayTime);
            this.resetForm();
        } else {
            this.openSnackBar('Please fill in all required fields.', this.snackBarDisplayTime);
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

    openSnackBar(message: string, duration: number = 0) {
        this.snackBar.open(message, undefined, {
            duration,
        });
    }
}

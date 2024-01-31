import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { FormControl, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionService } from '@app/services/question.service';
import { HttpResponse } from '@angular/common/http';
//import { QuestionListItemComponent } from '@app/components/question-list-item/question-list-item.component';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent implements OnInit {
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    @Output() pointsChanged: EventEmitter<number> = new EventEmitter<number>(); // To updates the points

    // choiceColors: string[] = ['#ff9999', '#99ff99', '#9999ff', '#ffff99'];
    // bottomBordersColour: string[] = ['#ff999', '#99ff9', '#999ff', '#ffff9'];

    updatePoints() {
        this.pointsChanged.emit(this.question.points);
        console.log(this.question.points);
    }

    ngOnInit(): void {
        // should refresh all the questions ?
        // this.questionService.getAllQuestions().subscribe((data: Question[]) => (this.questions = [...data]));
        // this.questionFormControl.valueChanges.subscribe((value) => {
        //     if (value) {
        //         const temporaryQuestion: Question = {
        //             type: 'QCM',
        //             description: '',
        //             question: value,
        //             points: 0,
        //             choices: [],
        //             lastModification: '2018-11-13T20:20:39+00:00',
        //         };
        //         this.questions = [temporaryQuestion, ...this.questions];
        //     }
        // });
    }

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

    questions: Question[] = [];

    response: string = '';

    private readonly snackBarDisplayTime = 2000;
    private readonly minChoices = 2;
    private readonly maxChoices = 4;

    // References: https://stackoverflow.com/questions/49782253/angular-reactive-form

    constructor(
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        private readonly questionService: QuestionService,
    ) // All forms are required.
    // Should create a function to check if a choice is checked ? Min one checked, one unchecked.

    {
        this.questionForm = this.fb.group({
            question: ['', Validators.required],
            description: ['', Validators.required],
            points: [0, Validators.required],
            types: this.fb.array([{ type: 'QCM' }, { type: 'QRL' }]),
            choices: this.fb.array([
                { choice: '', isCorrect: true }, // isCorrect is ischecked
                { choice: '', isCorrect: true },
            ]),
        });
    }

    addChoice() {
        // if (this.questionForm.valid) {
        //     console.log("blah",this.questionForm);
        // }
        // if (this.question.choices && this.question.choices?.length < this.maxChoices) {
        //     this.question.choices?.push({ choice: '', isCorrect: false });
        // } else {
        //     this.openSnackBar('4 choix est le maximum', this.snackBarDisplayTime);
        //     return;
        // }
        const choices = this.questionForm.get('choices') as FormArray;
        console.log('length', choices.length);
        if (choices.length < this.maxChoices) {
            choices.push({ choice: '', isCorrect: false });
        }
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    get types(): FormArray{
        return this.questionForm.get('types') as FormArray;
    }

    submitForm(questionSubmitted: any) {
        // euh
        console.log(questionSubmitted);
        if (this.questionForm.valid) {
            // this.saveQuestion();
            this.openSnackBar('Question saved', this.snackBarDisplayTime);
            this.resetForm();
        }
        // } else {
        //     this.openSnackBar('Please fill in all required fields.', this.snackBarDisplayTime);
        // }
    }

    removeChoice(index: number) {
        //    if (this.question.choices && this.minChoices < this.question.choices?.length) this.question.choices?.splice(index, 1);
        //     else {
        //         this.openSnackBar('2 choix est le minimum', this.snackBarDisplayTime);
        //         return;
        //     }
        // Using reactive forms

        const choices = this.questionForm.get('choices') as FormArray;

        console.log('length', choices.length);

        if (choices.length > this.minChoices) {
            choices?.removeAt(index);
        } else {
            this.openSnackBar('2 choix est le minimum', this.snackBarDisplayTime);
            return;
        }
    }

    addQuestion() {
        this.questionService.saveQuestion(this.questions[0]).subscribe((response: HttpResponse<string>) => {
            this.response = response.statusText;
        });
    }

    getControls() {
        return (this.questionForm.get('controlName') as FormArray).controls;
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

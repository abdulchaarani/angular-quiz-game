import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { FormControl, Validators, FormBuilder, FormGroup, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent implements OnInit, OnChanges {
    @Input() question: Question;
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();

    response: string = '';
    modifyingForm: boolean = false;
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;

    private readonly snackBarDisplayTime = 2000;
    private readonly minChoices = 2;
    private readonly maxChoices = 4;
    private readonly base36 = 36;

    constructor(
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
    ) {
        this.initializeForm();
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    buildChoices(): FormGroup {
        return this.fb.group({
            text: ['', Validators.required],
            isCorrect: [false, Validators.required],
        });
    }

    validateChoicesLength(control: AbstractControl): ValidationErrors | null {
        const choices = control.get('choices') as FormArray;

        let hasCorrect = false;
        let hasIncorrect = false;

        for (let i = 0; i < choices.length; i++) {
            const isCorrect = choices.at(i).get('isCorrect')?.value;

            if (isCorrect === true) {
                hasCorrect = true;
            } else if (isCorrect === false) {
                hasIncorrect = true;
            }
        }

        if (hasCorrect && hasIncorrect) {
            return null;
        } else {
            return { invalidChoicesLength: true };
        }
    }

    addChoice() {
        const choices = this.questionForm.get('choices') as FormArray;
        if (choices.length < this.maxChoices) {
            this.choices.push(this.buildChoices());
        } else {
            this.openSnackBar('4 choix est le maximum', this.snackBarDisplayTime);
            return;
        }
    }

    drop(event: CdkDragDrop<this>) {
        moveItemInArray(this.choices.controls, event.previousIndex, event.currentIndex);
        this.updateChoiceNumbers();
    }

    onSubmitQuestionBank() {
        if (this.questionForm.valid) {
            const newQuestion: Question = this.questionForm.value;
            newQuestion.id = this.getRandomString();
            this.createQuestionEventQuestionBank.emit(newQuestion);
        }
    }

    onSubmit() {
        if (this.questionForm.valid) {
            const newQuestion: Question = this.questionForm.value;
            newQuestion.lastModification = new Date().toLocaleString();
            newQuestion.id = this.getRandomString();
            this.createQuestionEvent.emit(newQuestion);
        }
    }

    removeChoice(index: number) {
        const choices = this.questionForm.get('choices') as FormArray;
        if (choices.length > this.minChoices) {
            this.choices?.removeAt(index);
        } else {
            this.openSnackBar('2 choix est le minimum', this.snackBarDisplayTime);
            return;
        }
    }

    getRandomString = (): string => (Math.random() + 1).toString(this.base36).substring(2);

    updateChoiceNumbers() {
        this.choices.controls.forEach((control, index) => {
            control.get('number')?.setValue(index + 1);
        });
    }

    openSnackBar(message: string, duration: number = 0) {
        this.snackBar.open(message, undefined, {
            duration,
        });
    }

    ngOnInit(): void {
        if (this.modifyingForm) {
            this.questionForm.valueChanges.subscribe((formValue) => {
                this.question.text = formValue?.text;
                this.question.type = formValue?.type;
                this.question.points = formValue?.points;
                this.question.lastModification = new Date().toLocaleDateString();
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question && this.question) {
            this.modifyingForm = true;
            this.updateFormValues();
        }
    }

    private initializeForm(): void {
        this.questionForm = this.fb.group(
            {
                text: ['', Validators.required],
                points: ['', Validators.required],
                type: ['QCM'],
                choices: this.fb.array([
                    this.fb.group({
                        text: ['', Validators.required],
                        isCorrect: [true, Validators.required],
                    }),
                    this.fb.group({
                        text: ['', Validators.required],
                        isCorrect: [false, Validators.required],
                    }),
                ]),
            },
            { validators: this.validateChoicesLength },
        );
    }

    private updateFormValues(): void {
        this.questionForm.patchValue({
            text: this.question?.text,
            points: this.question?.points,
            type: this.question?.type,
            lastModification: this.question?.lastModification,
        });

        const choicesArray = this.questionForm.get('choices') as FormArray;
        choicesArray.clear();
        this.question.choices?.forEach((choice) => {
            choicesArray.push(
                this.fb.group({
                    text: choice.text,
                    isCorrect: choice.isCorrect,
                }),
            );
        });
    }
}

// References:
// https://stackoverflow.com/questions/49782253/angular-reactive-form
// https://stackoverflow.com/questions/53362983/angular-reactiveforms-nested-formgroup-within-formarray-no-control-found?rq=3
// https://stackblitz.com/edit/angular-nested-formarray-dynamic-forms?file=src%2Fapp%2Fapp.component.html
// https://stackoverflow.com/questions/67834802/template-error-type-abstractcontrol-is-not-assignable-to-type-formcontrol
// https://stackoverflow.com/questions/39679637/angular-2-form-cannot-find-control-with-path

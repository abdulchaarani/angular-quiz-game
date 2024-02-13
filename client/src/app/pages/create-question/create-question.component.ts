import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Question } from '@app/interfaces/question';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent implements OnInit, OnChanges {
    @Input() question: Question;
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() createQuestionEventQuestionBank: EventEmitter<Question> = new EventEmitter<Question>();
    @Input() createNewQuestionButton: boolean = true;
    @Input() createNewQuestionToBankButton: boolean = true;

    response: string = '';
    modifyingForm: boolean = false;
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    color: unknown;
    checked: unknown;
    disabled: unknown;

    private readonly snackBarDisplayTime = 2000;
    private readonly minChoices = 2;
    private readonly maxChoices = 4;

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

    onSubmitQuestionBank() {
        if (this.questionForm.valid) {
            const newQuestion: Question = this.questionForm.value;
            this.createQuestionEventQuestionBank.emit(newQuestion);
        }
    }

    onSubmit() {
        if (this.questionForm.valid) {
            const newQuestion: Question = this.questionForm.value;
            newQuestion.lastModification = new Date().toString();
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
                this.question.lastModification = new Date().toString();
                this.question.choices = formValue.choices;
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.question && this.question) {
            this.modifyingForm = true;
            this.updateFormValues();
        }
    }

    drop(event: CdkDragDrop<this>) {
        if (this.questionForm) {
            moveItemInArray(this.choices.controls, event.previousIndex, event.currentIndex);
            this.choices.controls.forEach((control, index) => {
                control.patchValue({ number: index + 1 }, { emitEvent: false });
            });
        }
        if (this.question) {
            this.question.choices = this.questionForm.value.choices;
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
            if (choice.text.trim() !== '') {
                choicesArray.push(
                    this.fb.group({
                        text: choice.text,
                        isCorrect: choice.isCorrect,
                    }),
                );
            }
        });
    }
}

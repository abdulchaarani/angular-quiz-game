import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Inject, Input, OnChanges, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAX_CHOICES, MIN_CHOICES, SNACK_BAR_DISPLAY_TIME } from '@app/constants/question-creation';
import { QuestionType } from '@common/constants/question-types';
import { ManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question/question.service';

export interface DialogManagement {
    modificationState: ManagementState;
}
@Component({
    selector: 'app-question-creation-form',
    templateUrl: './question-creation-form.component.html',
    styleUrls: ['./question-creation-form.component.scss'],
})
export class QuestionCreationFormComponent implements OnInit, OnChanges {
    @Input() question: Question;
    @Input() modificationState: ManagementState;
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() modifyQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();

    response: string = '';
    modifyingForm: boolean = false;
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    checked: boolean;
    disabled: boolean;

    // Allow more constructor parameters to reduce logic in the component
    // eslint-disable-next-line max-params
    constructor(
        private readonly snackBar: MatSnackBar,
        private readonly formBuilder: FormBuilder,
        private readonly questionService: QuestionService,
        @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: DialogManagement,
    ) {
        this.initializeForm();
        if (dialogData) {
            this.modificationState = dialogData.modificationState;
        }
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    buildChoices(): FormGroup {
        return this.formBuilder.group({
            text: ['', Validators.required],
            isCorrect: [false, Validators.required],
        });
    }

    addChoice() {
        const choices = this.questionForm.get('choices') as FormArray;
        if (choices.length < MAX_CHOICES) {
            this.choices.push(this.buildChoices());
        } else {
            this.openSnackBar('Il ne peut pas y avoir plus de 4 choix.', SNACK_BAR_DISPLAY_TIME);
            return;
        }
    }

    dropChoice(event: CdkDragDrop<this>) {
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

    onSubmit() {
        if (this.questionForm.valid) {
            const newQuestion: Question = this.questionForm.value;
            newQuestion.lastModification = new Date().toLocaleString();
            if (this.modificationState === ManagementState.BankModify) {
                this.modifyQuestionEvent.emit(newQuestion);
            } else {
                this.createQuestionEvent.emit(newQuestion);
            }
        }
    }

    removeChoice(index: number) {
        const choices = this.questionForm.get('choices') as FormArray;
        if (choices.length > MIN_CHOICES) {
            this.choices?.removeAt(index);
        } else {
            this.openSnackBar('Il ne peut pas y avoir moins de 2 choix', SNACK_BAR_DISPLAY_TIME);
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
                this.question.lastModification = new Date().toLocaleDateString();
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

    getButtonText() {
        switch (this.modificationState) {
            case ManagementState.BankCreate:
                return 'Ajouter la question à la banque';
            case ManagementState.GameCreate:
                return 'Vérifier si la question est valide';
            case ManagementState.BankModify:
                return 'Modifier la question';
            case ManagementState.GameModify:
                return 'Modifier la question';
        }
    }

    isActiveSubmit() {
        return this.modificationState !== ManagementState.GameModify;
    }

    private initializeForm(): void {
        this.questionForm = this.formBuilder.group(
            {
                text: ['', Validators.required],
                points: ['', Validators.required],
                type: ['', Validators.required],
            },
            { validators: this.questionService.validateChoicesLength },
        );

        this.questionForm.statusChanges.subscribe((status) => {
            if (this.questionForm.get('text')?.invalid) {
                this.openSnackBar('Le champ de la question est requis !', SNACK_BAR_DISPLAY_TIME);
            } else if (status === 'INVALID' && this.questionForm.hasError('choices')) {
                this.openSnackBar('Il faut au moins une réponse correcte et une incorrecte !');
            } else if (this.questionForm.get('points')?.invalid) {
                this.openSnackBar('Le champs points est requis !', SNACK_BAR_DISPLAY_TIME);
            }
            if (this.questionForm.get('type')?.invalid) {
                this.openSnackBar('Le champ type est requis !', SNACK_BAR_DISPLAY_TIME);
            }
        });

        this.questionForm.get('type')?.valueChanges.subscribe((type: string) => {
            if (type === QuestionType.MultipleChoice) {
                this.questionForm.addControl(
                    'choices',
                    this.formBuilder.array([
                        this.formBuilder.group({
                            text: ['', Validators.required],
                            isCorrect: [true, Validators.required],
                        }),
                        this.formBuilder.group({
                            text: ['', Validators.required],
                            isCorrect: [false, Validators.required],
                        }),
                    ]),
                );
            } else if (type === QuestionType.LongAnswer) {
                this.questionForm.removeControl('choices');
            }
        });
    }

    private updateFormValues(): void {
        this.questionForm.patchValue({
            text: this.question?.text,
            points: this.question?.points,
            type: this.question?.type,
            lastModification: this.question?.lastModification,
        });

        const choicesArray = this.questionForm.get('choices') as FormArray;
        if (!choicesArray) return;
        choicesArray.clear();
        this.question.choices?.forEach((choice) => {
            if (choice.text.trim() !== '') {
                choicesArray.push(
                    this.formBuilder.group({
                        text: choice.text,
                        isCorrect: choice.isCorrect,
                    }),
                );
            }
        });
    }
}

// References:
// https://stackoverflow.com/questions/49782253/angular-reactive-form
// https://stackoverflow.com/questions/53362983/angular-reactiveforms-nested-formgroup-within-formarray-no-control-found?rq=3
// https://stackblitz.com/edit/angular-nested-formarray-dynamic-forms?file=src%2Fapp%2Fapp.component.html
// https://stackoverflow.com/questions/67834802/template-error-type-abstractcontrol-is-not-assignable-to-type-formcontrol
// https://stackoverflow.com/questions/39679637/angular-2-form-cannot-find-control-with-path

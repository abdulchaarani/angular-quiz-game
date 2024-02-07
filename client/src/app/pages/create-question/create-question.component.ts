import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Question } from '@app/interfaces/question';
import { FormControl, Validators, FormBuilder, FormGroup, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
//  import { QuestionService } from '@app/services/question.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
//import { HttpResponse } from '@angular/common/http';
//import { ApiService } from '@app/services/api.service';
//import { v4 as uuidv4 } from 'uuid';

// import { GamesService } from '@app/services/games.service';

@Component({
    selector: 'app-create-question',
    templateUrl: './create-question.component.html',
    styleUrls: ['./create-question.component.scss'],
})
export class CreateQuestionComponent implements OnInit, OnChanges {
    questionFormControl = new FormControl('', [Validators.required]);
    questionForm: FormGroup;
    @Input() question: Question; 
    @Output() pointsChanged: EventEmitter<number> = new EventEmitter<number>();
    @Output() createQuestionEvent: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() cancelClicked: EventEmitter<void> = new EventEmitter<void>(); 

    private readonly snackBarDisplayTime = 2000;
    private readonly minChoices = 2;
    private readonly maxChoices = 4;
    //private apiService: ApiService<Question>;

    onCancel(): void {
        this.cancelClicked.emit();
    }


    // Reference for forms: https://stackblitz.com/edit/angular-nested-formarray-dynamic-forms?file=src%2Fapp%2Fapp.component.html
    // references for above code: https://stackoverflow.com/questions/67834802/template-error-type-abstractcontrol-is-not-assignable-to-type-formcontrol

    //ngOnInit(): void {}
    // Modify for this to only be accessible if we're modifying a question
    ngOnInit(): void {
        this.initializeForm();
        // this.questionForm.valueChanges.subscribe((formValue) => {
        //     this.question.text = formValue.text;
        //     this.question.points = formValue.points;
        //     this.question.lastModification = new Date().toLocaleDateString();
        //     this.question.choices = formValue.choices;
        //   });
      }
    
      ngOnChanges(changes: SimpleChanges): void {
        // if (changes.question && this.question) {
        //   this.initializeForm();
        // }
      }
    
      private initializeForm(): void {
        // this.questionForm.patchValue({
        //   text: this.question.text,
        //   points: this.question.points,
        //   types: this.question.type,
        //   choices: (this.question.choices),
          
        // });
      }

      getChoices(choices : []){
        const choicesArray = this.questionForm.get('choices') as FormArray;
        choicesArray.clear(); 
      
        // this.question.choices.forEach((choice) => {
        //   choicesArray.push(
        //     this.fb.group({
        //       choice: [choice.choice, Validators.required],
        //       isCorrect: [choice.isCorrect, Validators.required],
        //     })
        //   );
        // });
      }
    response: string = '';

    // References: https://stackoverflow.com/questions/49782253/angular-reactive-form

    // In the question: add lastmodified and lastadded

    constructor(
        private snackBar: MatSnackBar,
        private fb: FormBuilder,
        //private gameService: GamesService,
     //private questionService: QuestionService, // Solution for the choicesGroup was inspired from here:
    ) // https://stackoverflow.com/questions/53362983/angular-reactiveforms-nested-formgroup-within-formarray-no-control-found?rq=3
    {
        this.questionForm = this.fb.group({
            text: ['', Validators.required],
            points: ['', Validators.required],
            types: ['QCM'],

            choices: this.fb.array(
                [
                    this.fb.group({
                        choice: ['', Validators.required],
                        isCorrect: [true, Validators.required],
                    }),
                    this.fb.group({
                        choice: ['', Validators.required],
                        isCorrect: [false, Validators.required],
                    }),
                ],
                // { validators: this.validateChoicesLength.bind(this) }, // should pass a reference only
            ),
        });
    }

    buildChoices(): FormGroup {
        return this.fb.group({
            choice: ['', Validators.required],
            isCorrect: [false, Validators.required],
        });
    }


    // Find out why the validators are not working:

    validateChoicesLength(control: AbstractControl): ValidationErrors | null {
        let isCorrectCount = 0;
        let hasIncorrectCount = 0;

        const choices = control.get('choices') as FormArray;

        for (let i = 0; i < choices?.length; i++) {
            const isCorrect = choices.at(i).get('isCorrect')?.value;

            if (isCorrect === true) {
                isCorrectCount += 1;
            } else if (isCorrect === false) {
                hasIncorrectCount += 1;
            }

            console.log('iscorrect', isCorrectCount);
            console.log('hasIncor', hasIncorrectCount);

            // if(isCorrect>=1 && hasIncorrect>=1 ){
            //     return true;
            // console.log("checks out");
            // isCorrect = 0;
            // hasIncorrect = 0;
        }

        return isCorrectCount >= 1 && hasIncorrectCount >= 1 ? null : { invalidChoicesLength: true };
    }

    // https://stackoverflow.com/questions/39679637/angular-2-form-cannot-find-control-with-path

    addChoice() {
        const choices = this.questionForm.get('choices') as FormArray;

        //const choicess = (control.get('choices') as FormArray)?.controls;
        // console.log('length', choices.length);
        //console.log('choices', choices.value);
        // console.log('choices', choices.value[0].isCorrect);

        if (choices.length < this.maxChoices) {
            this.choices.push(this.buildChoices());
        } else {
            this.openSnackBar('4 choix est le maximum', this.snackBarDisplayTime);
            return;
        }
    }

    get choices(): FormArray {
        return this.questionForm.get('choices') as FormArray;
    }

    get types(): FormArray {
        return this.questionForm.get('types') as FormArray;
    }

    removeChoice(index: number) {
        const choices = this.questionForm.get('choices') as FormArray;

        console.log('length', choices.length);

        if (choices.length > this.minChoices) {
            this.choices?.removeAt(index);
        } else {
            this.openSnackBar('2 choix est le minimum', this.snackBarDisplayTime);
            return;
        }
    }

    drop(event: CdkDragDrop<this>) {
        //const choices = this.questionForm.get('choices') as FormArray;
        moveItemInArray(this.choices.controls, event.previousIndex, event.currentIndex);
        this.updateChoiceNumbers();
    }

    onSubmitQuestionBank(){
        if(this.questionForm.valid){
            const newQuestion: Question = this.questionForm.value;
            console.log(newQuestion);
        }
    }


    onSubmit() {
        if (this.questionForm.valid) {

            const newQuestion: Question = this.questionForm.value;
            newQuestion.lastModification = new Date().toLocaleString();
            console.log("newQUestion", newQuestion);
            //this.createQuestionEvent.
            this.createQuestionEvent.emit(newQuestion);

        }
    }


    getControls() {
        return (this.questionForm.get('controlName') as FormArray).controls;
    }

    // https://angular.io/api/forms/FormControl
    resetForm() {
        // this.questionForm.reset({
        //     questionFormControl: '',
        //     points: 0,
        //     choices: [
        //         { choice: '', isCorrect: true },
        //         { choice: '', isCorrect: true },
        //     ],
        // });
    }

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
}

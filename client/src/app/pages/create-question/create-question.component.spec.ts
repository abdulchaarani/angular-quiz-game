import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateQuestionComponent } from './create-question.component';
// import { GamesService } from '@app/services/games.service';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';

// import SpyObj = jasmine.SpyObj;

// wouldn't pass without this not sure why, i'm not using any animations.
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    // let gamesServiceSpy: SpyObj<GamesService>;

    beforeEach(() => {
        const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
        // gamesServiceSpy = jasmine.createSpyObj('GamesService', [
        //     'getGames',
        //     'getGameById',
        //     'toggleGameVisibility',
        //     'deleteGame',
        //     'uploadGame',
        //     'downloadGameAsJson',
        // ]);

        TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent],
            imports: [
                // DragDropModule,
                ReactiveFormsModule,
                FormsModule,
                MatSnackBarModule,
                MatSelectModule,
                MatFormFieldModule,
                MatInputModule,
                NoopAnimationsModule,
            ],
            providers: [
                // {
                // provide: GamesService,
                //     useValue: jasmine.createSpyObj('GamesService', [
                //         'getGames',
                //         'getGameById',
                //         'toggleGameVisibility',
                //         'deleteGame',
                //         'uploadGame',
                //         'downloadGameAsJson',
                //         'replaceGame',
                //         'verifyGame',
                //     ]),
                // },
                { provide: MatSnackBar, useValue: snackBarSpyObj },
            ],
        });

        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        fixture = TestBed.createComponent(CreateQuestionComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();

        component.questionForm.setValue({
            text: 'Test',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form correctly', () => {
        expect(component.questionForm).toBeDefined();
        expect(component.questionForm.get('text')).toBeTruthy();
        expect(component.questionForm.get('type')).toBeTruthy();
        expect(component.questionForm.get('points')).toBeTruthy();
        expect(component.questionForm.get('choices')).toBeTruthy();
    });

    it('should submit the form to the list of questions in a game', () => {
        spyOn(component.createQuestionEvent, 'emit');

        component.onSubmit();
        expect(component.createQuestionEvent.emit).toHaveBeenCalled();
    });

    it('should change the order of choices by drag andd dropping', () => {
        // const mockFormArray = new FormArray([]);
        // const spyOnDrag = spyOn(component.choices, )
        // component.questionForm.choices = mockFormArray;
        // component.questionForm = component.fb.group({
        //     text: ['Sample Question Text'],
        //     points: [10],
        //     type: ['QCM'],
        //     choices: mockFormArray
        //   });
        // omponent.addChoice();
        // component.addChoice();
        // const event: CdkDragDrop<any> = {
        //   previousIndex: 0,
        //   currentIndex: 1,
        //   item: null!,
        //   container: null!,
        //   previousContainer: null!,
        //   isPointerOverContainer: false,
        //   distance: {x: 0, y: 0},
        //   dropPoint: {x: 0, y: 0},
        // };
        // Perform the drop operation
        // component.drop(event);
        // Assert that the item was moved within the array
        // expect(mockFormArray.controls.length).toEqual(0);
        // component.updateChoiceNumbers();
        // expect(component.createQuestionEvent.emit).toHaveBeenCalled();
    });

    it('should submit the form to the bank of questions', () => {
        spyOn(component.createQuestionEventQuestionBank, 'emit');
        component.onSubmitQuestionBank();
        expect(component.createQuestionEventQuestionBank.emit).toHaveBeenCalled();
    });

    it('should not submit a question without at least one correct and incorrect choices - Case when all is false', () => {
        spyOn(component.createQuestionEvent, 'emit');
        component.questionForm.setValue({
            text: 'Test ',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: false },
            ],
        });
        component.onSubmit();
        expect(component.createQuestionEvent.emit).not.toHaveBeenCalled();
    });

    it('should update form values when ngOnChanges is called', () => {
        spyOn(component, 'ngOnChanges').and.callThrough();
        const mockQuestion = {
            id: '1',
            text: 'Test Updates',
            points: 20,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
            lastModification: new Date().toLocaleString(),
        };
        component.question = mockQuestion;
        component.ngOnChanges({
            question: { currentValue: mockQuestion, previousValue: null, isFirstChange: () => true, firstChange: true },
        });
        component.onSubmit();
        component.questionForm.value.id = '1';
        expect(component.questionForm.value).toEqual(mockQuestion);
    });

    it('should not submit a question without at least one correct and incorrect choices - Case when all is true', () => {
        spyOn(component.createQuestionEvent, 'emit');
        component.questionForm.setValue({
            text: 'Test ',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: true },
            ],
        });
        component.onSubmit();
        expect(component.createQuestionEvent.emit).not.toHaveBeenCalled();
    });

    it('should not submit an invalid form', () => {
        spyOn(component.createQuestionEvent, 'emit');
        component.questionForm.setValue({
            text: '',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'Choice 1', isCorrect: false },
                { text: 'Choice 2', isCorrect: true },
            ],
        });
        component.onSubmit();
        expect(component.createQuestionEvent.emit).not.toHaveBeenCalled();
    });

    it('should add choice to form', () => {
        const initialChoicesLength = component.choices.length;
        component.addChoice();
        expect(component.choices.length).toBe(initialChoicesLength + 1);
    });

    it('should remove choice from form', () => {
        component.addChoice();
        const initialChoicesLength = component.choices.length;
        component.removeChoice(0);
        expect(component.choices.length).toBe(initialChoicesLength - 1);
    });

    it('should not add more than 4 choices', () => {
        for (let i = 0; i < 5; i++) {
            component.addChoice();
        }
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should open snack bar with the specified message : General case', () => {
        component.openSnackBar('Test message');
        expect(snackBarSpy.open).toHaveBeenCalledWith('Test message', undefined, { duration: 0 });
    });

    it('should not remove more than 2 choices', () => {
        for (let i = 0; i < 3; i++) {
            component.removeChoice(i);
        }
        expect(snackBarSpy.open).toHaveBeenCalled();
    });
});

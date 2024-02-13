import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateQuestionComponent } from './create-question.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Question } from '@app/interfaces/question';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

const mockQuestion: Question = {
    id: '1',
    text: 'Test Question',
    points: 10,
    type: 'QCM',
    choices: [
        { text: 'Choice 1', isCorrect: true },
        { text: 'Choice 2', isCorrect: false },
    ],
    lastModification: new Date().toString(),
};

const maxchoicesLengthTest = 5;
const minchoicesLengthTest = 3;

fdescribe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let formBuilder: FormBuilder;

    beforeEach(() => {
        const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent],
            imports: [ReactiveFormsModule, FormsModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule],
            providers: [{ provide: MatSnackBar, useValue: snackBarSpyObj }, FormBuilder],
        });

        snackBarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
        fixture = TestBed.createComponent(CreateQuestionComponent);
        formBuilder = TestBed.inject(FormBuilder);
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

    it('should handle drag and drop event', () => {
        component.questionForm.setControl(
            'choices',
            formBuilder.array([
                formBuilder.group({
                    text: 'Choice 1',
                    isCorrect: true,
                }),
                formBuilder.group({
                    text: 'Choice 2',
                    isCorrect: false,
                }),
            ]),
        );

        component.question = mockQuestion;
        const mockEvent = {
            previousIndex: 1,
            currentIndex: 0,
            container: { data: component.questionForm.controls.value },
            previousContainer: { data: component.questionForm.controls.value },
        } as unknown as CdkDragDrop<CreateQuestionComponent>;

        fixture.detectChanges();
        component.drop(mockEvent);

        expect(component.questionForm.value.choices[0].text).toEqual('Choice 2');
        expect(component.questionForm.value.choices[1].text).toEqual('Choice 1');
        expect(component.question.choices).toEqual(component.questionForm.value.choices);
    });

    it('should initialize the form correctly', () => {
        expect(component.questionForm).toBeDefined();
        expect(component.questionForm.get('text')).toBeTruthy();
        expect(component.questionForm.get('type')).toBeTruthy();
        expect(component.questionForm.get('points')).toBeTruthy();
        expect(component.questionForm.get('choices')).toBeTruthy();
    });

    it('should update question choices when form value changes', () => {
        component.question = mockQuestion;
        component.modifyingForm = true;

        component.ngOnInit();

        component.questionForm.patchValue({
            text: 'New Test',
            points: 10,
            type: 'QCM',
            choices: [
                { text: 'New Choice 1', isCorrect: false },
                { text: 'New Choice 2', isCorrect: true },
            ],
        });

        component.questionForm.value.id = '1';
        component.questionForm.value.lastModification = new Date().toString();
        expect(component.question).toEqual(component.questionForm.value);
    });

    it('should submit the form to the list of questions in a game', () => {
        spyOn(component.createQuestionEvent, 'emit');
        component.onSubmit();
        expect(component.createQuestionEvent.emit).toHaveBeenCalled();
    });

    it('should submit the form to the bank of questions', () => {
        spyOn(component.createQuestionEventQuestionBank, 'emit');
        component.onSubmitQuestionBank();
        expect(component.createQuestionEventQuestionBank.emit).toHaveBeenCalled();
    });

    it('should submit the form to the list of questions in a game', () => {
        spyOn(component.createQuestionEvent, 'emit');
        const mockQuestionSubmit: Question = component.questionForm.value;
        mockQuestion.lastModification = new Date().toString();
        component.onSubmit();
        expect(component.createQuestionEvent.emit).toHaveBeenCalledWith(mockQuestionSubmit);
    });

    it('should submit the form to the bank of questions', () => {
        spyOn(component.createQuestionEventQuestionBank, 'emit');
        const mockQuestionSubmitToBank: Question = component.questionForm.value;
        mockQuestion.lastModification = new Date().toString();
        component.onSubmitQuestionBank();
        expect(component.createQuestionEventQuestionBank.emit).toHaveBeenCalledWith(mockQuestionSubmitToBank);
    });

    it('should update form values when ngOnChanges is called', () => {
        spyOn(component, 'ngOnChanges').and.callThrough();
        component.question = mockQuestion;
        component.ngOnChanges({
            question: { currentValue: mockQuestion, previousValue: null, isFirstChange: () => true, firstChange: true },
        });
        component.onSubmit();
        component.questionForm.value.id = '1';
        component.questionForm.value.lastModification = new Date().toString();
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

    it('should add a choice to form', () => {
        const initialChoicesLength = component.choices.length;
        component.addChoice();
        expect(component.choices.length).toBe(initialChoicesLength + 1);
    });

    it('should remove a choice from form', () => {
        component.addChoice();
        const initialChoicesLength = component.choices.length;
        component.removeChoice(0);
        expect(component.choices.length).toBe(initialChoicesLength - 1);
    });

    it('should open snack bar with the specified message : General case', () => {
        component.openSnackBar('Test message');
        expect(snackBarSpy.open).toHaveBeenCalledWith('Test message', undefined, { duration: 0 });
    });

    it('should not remove more than 2 choices', () => {
        for (let i = 0; i < minchoicesLengthTest; i++) {
            component.removeChoice(i);
        }
        expect(snackBarSpy.open).toHaveBeenCalled();
    });

    it('should not add more than 4 choices', () => {
        for (let i = 0; i < maxchoicesLengthTest; i++) {
            component.addChoice();
        }
        expect(snackBarSpy.open).toHaveBeenCalled();
    });
});

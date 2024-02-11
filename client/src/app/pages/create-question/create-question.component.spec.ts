import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CreateQuestionComponent } from './create-question.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateQuestionComponent', () => {
    let component: CreateQuestionComponent;
    let fixture: ComponentFixture<CreateQuestionComponent>;
    let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        const snackBarSpyObj = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent],
            imports: [ReactiveFormsModule, FormsModule, MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatInputModule, NoopAnimationsModule],
            providers: [{ provide: MatSnackBar, useValue: snackBarSpyObj }],
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
        const choicesLength = 5;
        for (let i = 0; i < choicesLength; i++) {
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

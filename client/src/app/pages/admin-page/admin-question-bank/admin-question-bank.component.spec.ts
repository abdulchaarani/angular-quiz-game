/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question.service';
import { AdminQuestionBankComponent } from './admin-question-bank.component';

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SortByLastModificationPipe } from '@app/pipes/sort-by-last-modification.pipe';
import { NotificationService } from '@app/services/notification.service';
import { of, throwError } from 'rxjs';

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let dialog: jasmine.SpyObj<MatDialog>;
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<any, any>>;

    const mockQuestions: Question[] = [
        {
            id: '1',
            type: 'QCM',
            text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
            points: 20,
            lastModification: '2024-11-13T20:20:39+00:00',
        },
        {
            id: '2',
            type: 'QCM',
            text: "Le ratio d'or est de 1:1.618, mais connaissez-vous le ratio d'argent?",
            points: 40,
            lastModification: '2018-01-20T14:17:39+00:00',
        },
    ];

    const newQuestionMock: Question = {
        id: 'X',
        type: 'QCM',
        text: 'Quelle est la capitale du canada?',
        points: 20,
        lastModification: '2024-01-26T14:21:19+00:00',
    };
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(newQuestionMock) });

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', [
            'getAllQuestions',
            'deleteQuestion',
            'createQuestion',
            'updateQuestion',
            'openCreateQuestionModal',
        ]);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockQuestions));
        questionServiceSpy.deleteQuestion.and.returnValue(of(mockHttpResponse));
        questionServiceSpy.createQuestion.and.returnValue(of(mockHttpResponse));
        const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

        TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent, SortByLastModificationPipe],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        });
        fixture = TestBed.createComponent(AdminQuestionBankComponent);
        component = fixture.componentInstance;
        dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        mockDialogRef = dialogRefSpy as jasmine.SpyObj<MatDialogRef<any, any>>;
        fixture.detectChanges();
        dialog.open.and.returnValue(mockDialogRef);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch questions after initialization', () => {
        expect(component.questions.length).toEqual(mockQuestions.length);
    });

    it('should order questions by earliest modification date', () => {
        expect(component.questions[0]).toEqual(mockQuestions[1]);
        expect(component.questions[1]).toEqual(mockQuestions[0]);
    });

    it('should delete a question', () => {
        const questionToDeleteId = '1';

        component.deleteQuestion('1');

        expect(questionServiceSpy.deleteQuestion).toHaveBeenCalledWith(questionToDeleteId);
        expect(component.questions.length).toBe(mockQuestions.length - 1);
    });

    it('should display a message when bank is empty', () => {
        component.questions = [];
        fixture.detectChanges();

        const dom = fixture.nativeElement;

        const emptyBankCard = dom.querySelector('.empty-list-card');
        expect(emptyBankCard).toBeTruthy();
    });

    it('should not display the empty bank message when not empty', () => {
        const dom = fixture.nativeElement;

        const emptyBankCard = dom.querySelector('.empty-bank-card');
        expect(emptyBankCard).toBeFalsy();
    });

    it('should add a question', () => {
        component.addQuestion(newQuestionMock);
        expect(questionServiceSpy.createQuestion).toHaveBeenCalledWith(newQuestionMock);
        expect(component.questions.length).toBe(mockQuestions.length + 1);
    });

    it('should keep ordering by earliest date after adding a question', () => {
        component.addQuestion(newQuestionMock);

        expect(component.questions[0]).toEqual(mockQuestions[1]);
        expect(component.questions[1]).toEqual(mockQuestions[0]);
        expect(component.questions[2]).toEqual(newQuestionMock);
    });

    it('should return false when questionList is empty', () => {
        const newQuestion: Question = { id: '1', text: 'New question', type: 'QCM', points: 10, lastModification: '' };
        const questionList: Question[] = [];
        const result = component['isDuplicateQuestion'](newQuestion, questionList);
        expect(result).toBeFalse();
    });

    it('should return false when newQuestion is not already in bank', () => {
        const result = component['isDuplicateQuestion'](newQuestionMock, mockQuestions);
        expect(result).toBeFalse();
    });

    it('should return true when newQuestion is in questionList with different id', () => {
        const newQuestion: Question = {
            id: '3',
            text: "Le ratio d'or est de 1:1.618, mais connaissez-vous le ratio d'argent?",
            type: 'QCM',
            points: 10,
            lastModification: '',
        };
        const result = component['isDuplicateQuestion'](newQuestion, mockQuestions);
        expect(result).toBeTrue();
    });

    it('should return false when newQuestion is in questionList with the same id', () => {
        const result = component['isDuplicateQuestion'](mockQuestions[0], mockQuestions);
        expect(result).toBeFalse();
    });

    it('should handle error in ngOnInit', () => {
        const errorMessage = 'Failed to fetch questions';
        questionServiceSpy.getAllQuestions.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));
        component.ngOnInit();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should handle error in deleteQuestion', () => {
        const errorMessage = 'Failed to delete question';
        questionServiceSpy.deleteQuestion.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));

        component.deleteQuestion('123');

        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should update question successfully', () => {
        questionServiceSpy.updateQuestion.and.returnValue(of(mockHttpResponse));
        component.updateQuestion(newQuestionMock);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should handle error when updating question', () => {
        const errorMessage = 'Failed to update question';
        questionServiceSpy.updateQuestion.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));
        component.updateQuestion(newQuestionMock);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should handle error when adding question', () => {
        const errorMessage = 'Failed to update question';
        questionServiceSpy.createQuestion.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));
        component.addQuestion();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should handle duplicate question', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isDuplicateQuestion').and.returnValue(true);
        component.updateQuestion(newQuestionMock);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });
});

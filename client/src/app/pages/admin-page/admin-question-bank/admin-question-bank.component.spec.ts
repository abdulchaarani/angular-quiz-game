import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question.service';
import { AdminQuestionBankComponent } from './admin-question-bank.component';

import { HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { SortByLastModificationPipe } from '@app/pipes/sort-by-last-modification.pipe';
import { NotificationService } from '@app/services/notification.service';
import { of } from 'rxjs';

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

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

    const newMockQuestion: Question = {
        id: 'X',
        type: 'QCM',
        text: 'Quelle est la capitale du canada?',
        points: 20,
        lastModification: '2024-01-26T14:21:19+00:00',
    };
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(newMockQuestion) });

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getAllQuestions', 'deleteQuestion', 'createQuestion']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockQuestions));
        questionServiceSpy.deleteQuestion.and.returnValue(of(mockHttpResponse));
        questionServiceSpy.createQuestion.and.returnValue(of(mockHttpResponse));

        TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent, SortByLastModificationPipe],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: MatDialog, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(AdminQuestionBankComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
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
        component.addQuestion(newMockQuestion);

        expect(questionServiceSpy.createQuestion).toHaveBeenCalledWith(newMockQuestion);
        expect(component.questions.length).toBe(mockQuestions.length + 1);
    });

    it('should keep ordering by earliest date after adding a question', () => {
        component.addQuestion(newMockQuestion);

        expect(component.questions[0]).toEqual(newMockQuestion);
        expect(component.questions[1]).toEqual(mockQuestions[1]);
        expect(component.questions[2]).toEqual(mockQuestions[0]);
    });
});

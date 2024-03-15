/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/question';
import { QuestionService } from '@app/services/question/question.service';
import { AdminQuestionBankComponent } from './admin-question-bank.component';

import { HttpResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionListItemComponent } from '@app/components/question-list-item/question-list-item.component';
import { getMockQuestion } from '@app/constants/question-mocks';
import { ManagementState } from '@app/constants/states';
import { SortByLastModificationPipe } from '@app/pipes/sort-by-last-modification.pipe';
import { BankService } from '@app/services/bank/bank.service';
import { of } from 'rxjs';

describe('AdminQuestionBankComponent', () => {
    let component: AdminQuestionBankComponent;
    let fixture: ComponentFixture<AdminQuestionBankComponent>;
    let questionSpy: jasmine.SpyObj<QuestionService>;
    let bankSpy: jasmine.SpyObj<BankService>;

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
    @Component({
        selector: 'app-question-creation-form',
        template: '',
    })
    class MockCreateQuestionComponent {
        @Input() modificationState: ManagementState;
        @Input() question: Question;
    }

    beforeEach(() => {
        questionSpy = jasmine.createSpyObj('QuestionService', [
            'getAllQuestions',
            'deleteQuestion',
            'createQuestion',
            'updateQuestion',
            'openCreateQuestionModal',
        ]);
        questionSpy.getAllQuestions.and.returnValue(of(mockQuestions));
        questionSpy.deleteQuestion.and.returnValue(of(mockHttpResponse));
        questionSpy.createQuestion.and.returnValue(of(mockHttpResponse));

        bankSpy = jasmine.createSpyObj('BankService', ['getAllQuestions', 'deleteQuestion', 'addQuestion', 'updateQuestion']);

        TestBed.configureTestingModule({
            declarations: [AdminQuestionBankComponent, SortByLastModificationPipe, QuestionListItemComponent, MockCreateQuestionComponent],
            imports: [MatExpansionModule, MatIconModule, BrowserAnimationsModule, MatCardModule],
            providers: [
                { provide: QuestionService, useValue: questionSpy },
                { provide: BankService, useValue: bankSpy },
            ],
        });

        fixture = TestBed.createComponent(AdminQuestionBankComponent);
        component = fixture.componentInstance;
        bankSpy.questions = [];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display a message when bank is empty', () => {
        bankSpy.questions = [];
        fixture.detectChanges();
        const dom = fixture.nativeElement;
        const emptyBankCard = dom.querySelector('.empty-list-card');
        expect(emptyBankCard).toBeTruthy();
    });

    it('should not display the empty bank message when not empty', () => {
        bankSpy.questions = [getMockQuestion()];
        fixture.detectChanges();
        const dom = fixture.nativeElement;
        const emptyBankCard = dom.querySelector('.empty-bank-card');
        expect(emptyBankCard).toBeFalsy();
    });
});

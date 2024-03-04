import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/question';
import { QuestionListItemComponent } from './question-list-item.component';
import { ManagementState } from '@app/constants/states';
//import { CreateQuestionComponent } from '@app/components/create-question/create-question.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Component, Input } from '@angular/core';


describe('QuestionListItemComponent', () => {
    let component: QuestionListItemComponent;
    //let createQuestionComponent: CreateQuestionComponent; 
    let fixture: ComponentFixture<QuestionListItemComponent>;
    const mockQuestion: Question = {
        id: '1',
        type: 'QCM',
        text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
        points: 20,
        lastModification: new Date().toString(),
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [CreateQuestionComponent, QuestionListItemComponent],
            imports: [ MatSnackBarModule, MatExpansionModule, MatIconModule, NoopAnimationsModule, BrowserAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionListItemComponent);
        component = fixture.componentInstance;
        component.question = mockQuestion;
        component.isBankQuestion = true; 
        component.index = 0;
        component.modificationState = ManagementState.BankModify;
    });

    @Component({
        selector: 'app-create-question',
        template: ''
      })
      class CreateQuestionComponent {
        @Input() modificationState: any;
      }

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display question details', () => {
        fixture.detectChanges();

        const dom = fixture.nativeElement;

        expect(dom.textContent).toContain(mockQuestion.text);
        expect(dom.textContent).toContain(mockQuestion.points);
    });

    it('should emit deleteQuestionEvent when deleteQuestion is called', () => {
        const spy = spyOn(component.deleteQuestionEvent, 'emit').and.callThrough();

        component.deleteQuestion();

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(mockQuestion.id);
    });

    it('should emit updateQuestionEvent when dispatchQuestion is called', () => {
        const spy = spyOn(component.updateQuestionEvent, 'emit').and.callThrough();

        component.dispatchModifiedQuestion();

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(mockQuestion);
    });

    it('should set modificationState to BankModify if it is a bank question', () => {
        component.isBankQuestion = true;
        component.ngOnInit();
        expect(component.modificationState).toBe(ManagementState.BankModify);
    });

    it('should set modificationState to GameModify if it is not a bank question', () => {
        component.isBankQuestion = false;
        component.ngOnInit();
        expect(component.modificationState).toBe(ManagementState.GameModify);
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionListItemComponent } from './question-list-item.component';
import { Question } from '@app/interfaces/question';

describe('QuestionListItemComponent', () => {
    let component: QuestionListItemComponent;
    let fixture: ComponentFixture<QuestionListItemComponent>;

    const mockQuestion: Question = {
        id: '1',
        type: 'QCM',
        description: 'Motifs sur ballon de soccer',
        question: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
        points: 20,
        lastModification: '2018-11-13T20:20:39+00:00',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionListItemComponent],
        });

        fixture = TestBed.createComponent(QuestionListItemComponent);
        component = fixture.componentInstance;

        component.question = mockQuestion;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display question details', () => {
        fixture.detectChanges();

        const dom = fixture.nativeElement;

        expect(dom.textContent).toContain(mockQuestion.description);
        expect(dom.textContent).toContain(mockQuestion.question);
        expect(dom.textContent).toContain(mockQuestion.points);
    });

    it('should display the modification date if isLastModifiedDateVisible is set to true', () => {
        component.isLastModifiedDateVisible = true;
        fixture.detectChanges();
        const dom = fixture.nativeElement;

        expect(dom.textContent).toContain('Dernière modification:');
    });

    it('should not display the modification date if isLastModifiedDateVisible is set to false', () => {
        component.isLastModifiedDateVisible = false;
        fixture.detectChanges();
        const dom = fixture.nativeElement;

        expect(dom.textContent).not.toContain('Dernière modification:');
    });

    it('should emit deleteQuestionEvent when deleteQuestion is called', () => {
        const spy = spyOn(component.deleteQuestionEvent, 'emit').and.callThrough();

        component.deleteQuestion();

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(mockQuestion.id);
    });
});

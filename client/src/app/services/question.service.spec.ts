import { TestBed } from '@angular/core/testing';
import { QuestionService } from './question.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Question } from '@app/interfaces/question';

describe('QuestionService', () => {
    let questionService: QuestionService;
    const mockQuestion: Question = {
        id: 'questionID',
        type: 'QCM',
        text: 'Question?',
        points: 30,
        choices: [],
        lastModification: new Date().toString(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionService],
        });
        questionService = TestBed.inject(QuestionService);
    });

    it('should be created', () => {
        expect(questionService).toBeTruthy();
    });

    it('should get all Questions', () => {
        const spy = spyOn(questionService, 'getAll').and.callThrough();
        questionService.getAllQuestions();
        expect(spy).toHaveBeenCalled();
    });

    it('should create a new question', () => {
        const spy = spyOn(questionService, 'add').and.callThrough();
        questionService.createQuestion(mockQuestion);
        expect(spy).toHaveBeenCalledWith(mockQuestion);
    });

    it('should create a delete question', () => {
        const spy = spyOn(questionService, 'delete').and.callThrough();
        questionService.deleteQuestion(mockQuestion.id);
        expect(spy).toHaveBeenCalledWith(mockQuestion.id);
    });
});

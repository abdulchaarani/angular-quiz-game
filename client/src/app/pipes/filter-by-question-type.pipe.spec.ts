import { getMockQuestion } from '@app/constants/question-mocks';
import { QuestionTypes } from '@app/constants/question-types';
import { FilterByQuestionTypePipe } from './filter-by-question-type.pipe';

const MOCK_QUESTIONS = [getMockQuestion(), getMockQuestion()];
MOCK_QUESTIONS[0].type = QuestionTypes.LONG;
MOCK_QUESTIONS[1].type = QuestionTypes.CHOICE;

describe('FilterByQuestionTypePipe', () => {
    const pipe = new FilterByQuestionTypePipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });
    it('should filter by choice questions', () => {
        const result = pipe.transform(MOCK_QUESTIONS, QuestionTypes.CHOICE);
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(MOCK_QUESTIONS[1]);
    });

    it('should filter by long questions', () => {
        const result = pipe.transform(MOCK_QUESTIONS, QuestionTypes.LONG);
        expect(result.length).toEqual(1);
        expect(result[0]).toEqual(MOCK_QUESTIONS[0]);
    });

    it('should return questions', () => {
        const result = pipe.transform(MOCK_QUESTIONS, '');
        expect(result.length).toEqual(2);
    });
});

import { Pipe, PipeTransform } from '@angular/core';
import { QuestionTypes } from '@app/constants/question-types';
import { Question } from '@app/interfaces/question';

@Pipe({
    name: 'filterByQuestionType',
})
export class FilterByQuestionTypePipe implements PipeTransform {
    transform(questions: Question[], filter: string): Question[] {
        if (filter === QuestionTypes.CHOICE) {
            return questions.filter((question: Question) => question.type === QuestionTypes.CHOICE);
        } else if (filter === QuestionTypes.LONG) {
            return questions.filter((questions: Question) => questions.type === QuestionTypes.LONG);
        }
        return questions;
    }
}

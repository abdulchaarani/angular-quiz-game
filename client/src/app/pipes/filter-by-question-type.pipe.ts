import { Pipe, PipeTransform } from '@angular/core';
import { QuestionType } from '@common/constants/question-types';
import { Question } from '@app/interfaces/question';

@Pipe({
    name: 'filterByQuestionType',
})
export class FilterByQuestionTypePipe implements PipeTransform {
    transform(questions: Question[], filter: string): Question[] {
        if (filter === QuestionType.MultipleChoice) {
            return questions.filter((question: Question) => question.type === QuestionType.MultipleChoice);
        } else if (filter === QuestionType.LongAnswer) {
            return questions.filter((question: Question) => question.type === QuestionType.LongAnswer);
        }
        return questions;
    }
}

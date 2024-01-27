import { Injectable } from '@nestjs/common';
// import * as fs from 'fs';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Question } from '@app/model/database/question';
import { v4 as uuidv4 } from 'uuid';
// import { CreateQuestionDto } from '@app/model/dto/question/question-dto';

@Injectable()
export class QuestionService {
    jsonPath: string;

    constructor() {
        this.jsonPath = resolve(__dirname, '../../../../../assets/questions.json');
    }

    getAllQuestions() {
        return readFileSync(this.jsonPath, 'utf8');
    }

    getAllMultipleChoiceQuestions() {
        const questions: Question[] = JSON.parse(readFileSync(this.jsonPath, 'utf8'));
        return questions.filter((question) => question.type === 'QCM');
    }

    // TODO: validate question input + DTO
    addQuestion(question: Question): boolean {
        question.id = uuidv4();
        const allQuestions: Question[] = JSON.parse(this.getAllQuestions());
        allQuestions.push(question);
        writeFileSync(this.jsonPath, JSON.stringify(allQuestions), 'utf8');
        return true;
    }

    deleteQuestion(questionId: string): boolean {
        const allQuestions: Question[] = JSON.parse(this.getAllQuestions());
        const previousQuestionAmount = allQuestions.length;
        const filteredQuestions: Question[] = allQuestions.filter((question: Question) => question.id !== questionId);
        if (previousQuestionAmount === filteredQuestions.length) return false;
        writeFileSync(this.jsonPath, JSON.stringify(filteredQuestions), 'utf8');
        return true;
    }
}

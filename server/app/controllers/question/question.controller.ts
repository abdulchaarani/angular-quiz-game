import { Question } from '@app/model/database/question';
import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('questions')
export class QuestionController {
    jsonPath: string;

    constructor() {
        this.jsonPath = path.resolve(__dirname, '../../../../../assets/questions.json');
    }

    @Get('/')
    findAll() {
        return fs.readFileSync(this.jsonPath, 'utf8');
    }

    @Get('/mcq')
    findMcq() {
        const questions: Question[] = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));

        return questions.filter((question) => question.type === 'QCM');
    }
}

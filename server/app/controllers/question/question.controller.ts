import { Controller, Get, Post, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { QuestionService } from '@app/services/question/question.service';
import { CreateQuestionDto } from '@app/model/dto/question/question-dto';
import { Question } from '@app/model/database/question';
@Controller('questions')
export class QuestionController {
    constructor(private questionService: QuestionService) {}

    // TODO: async try catch DB

    @Get('/')
    allQuestions() {
        return this.questionService.getAllQuestions();
    }

    @Get('/qcm')
    allMultipleChoiceQuestions() {
        return this.questionService.getAllMultipleChoiceQuestions();
    }

    @Post('/')
    addQuestion(@Body() question: Question) {
        this.questionService.addQuestion(question);
    }

    @Delete('/:questionId')
    deleteQuestion(@Param('questionId') questionId: string) {
        if (!questionId) throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
        if (!this.questionService.deleteQuestion(questionId)) {
            throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
        }
    }
}

import { CreateQuestionDto } from '@app/model/dto/question/question-dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('questions')
@Controller('questions')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Get('/')
    async allQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionService.getAllQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Get('/qcm')
    async sallMultipleChoiceQuestions(@Res() response: Response) {
        try {
            const allQuestions = await this.questionService.getAllMultipleChoiceQuestions();
            response.status(HttpStatus.OK).json(allQuestions);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }

    @Post('/')
    async addQuestion(@Body() questionDto: CreateQuestionDto, @Res() response: Response) {
        try {
            const question = await this.questionService.addQuestion(questionDto);
            response.status(HttpStatus.CREATED).send(JSON.stringify(question));
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send(error.message);
        }
    }

    @Delete('/:id')
    async deleteQuestion(@Param('id') id: string, @Res() response: Response) {
        try {
            await this.questionService.deleteQuestion(id);
            response.status(HttpStatus.NO_CONTENT).send();
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}

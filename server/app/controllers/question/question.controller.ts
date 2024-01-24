import { Controller, Delete, Get, HttpException, HttpStatus, Param } from '@nestjs/common';
import { QuestionService } from '@app/services/question/question.service';

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

    // @Delete('/:subjectCode')
    // async deleteCourse(@Param('subjectCode') subjectCode: string, @Res() response: Response) {
    //     try {
    //         await this.coursesService.deleteCourse(subjectCode);
    //         response.status(HttpStatus.OK).send();
    //     } catch (error) {
    //         response.status(HttpStatus.NOT_FOUND).send(error.message);
    //     }
    // }

    @Delete('/:questionId')
    deleteQuestion(@Param('questionId') questionId: string) {
        if (!questionId) throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
        if (!this.questionService.deleteQuestion(questionId)) {
            throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
        }
    }
}

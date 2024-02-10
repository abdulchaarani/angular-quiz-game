import { Question } from '@app/model/database/question';
import { QuestionService } from '@app/services/question/question.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuestionController } from './question.controller';

describe('QuestionController', () => {
    let controller: QuestionController;
    let questionService: SinonStubbedInstance<QuestionService>;

    beforeEach(async () => {
        questionService = createStubInstance(QuestionService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: questionService,
                },
            ],
        }).compile();

        controller = module.get<QuestionController>(QuestionController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allQuestions() should return all questions', async () => {
        const fakeQuestions = [new Question(), new Question()];
        questionService.getAllQuestions.resolves(fakeQuestions);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeQuestions);
            return res;
        };

        await controller.allQuestions(res);
    });

    it('allQuestions() should return NOT FOUND if the service fails', async () => {
        questionService.getAllQuestions.rejects('');
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.allQuestions(res);
    });

    it('questionById() should return the question with the corresponding ID', async () => {
        const fakeQuestion = new Question();
        questionService.getQuestionById.resolves(fakeQuestion);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (questions) => {
            expect(questions).toEqual(fakeQuestion);
            return res;
        };

        await controller.questionById('', res);
    });

    it('questionById() should return NOT_FOUND when service is unable to fetch the question', async () => {
        questionService.getQuestionById.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.questionById('', res);
    });

    it('addQuestion() should succeed if service is able to add the question', async () => {
        questionService.addQuestion.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        await controller.addQuestion(new Question(), res);
    });

    it('addQuestion() should return BAD_REQUEST when service is not able to find the course', async () => {
        questionService.addQuestion.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        await controller.addQuestion(new Question(), res);
    });

    it('updateQuestion() should succeed if service is able to update the question', async () => {
        questionService.updateQuestion.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.updateQuestion(new Question(), res);
    });

    // TODO: Check what happens if we edit question from a deleted game
    it('updateQuestion() should return NOT_FOUND when service cannot update the question', async () => {
        questionService.updateQuestion.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.updateQuestion(new Question(), res);
    });

    it('deleteQuestion() should succeed if service is able to delete the question', async () => {
        questionService.deleteQuestion.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuestion('', res);
    });

    it('deleteQuestion() should return NOT_FOUND when service cannot delete the question', async () => {
        questionService.deleteQuestion.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.deleteQuestion('', res);
    });
});

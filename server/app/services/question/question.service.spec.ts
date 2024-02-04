import { getRandomString } from '@app/constants/random-string';
import { constants } from '@app/constants/unit-tests-constants';
import { Question, QuestionDocument, questionSchema } from '@app/model/database/question';
import { Logger } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { QuestionService } from './question.service';

const stringifyPublicValues = (question: Question): string => {
    return JSON.stringify(question, (key, value) => {
        if (key !== '_id' && key !== '__v') return value;
    });
};

const getFakeQuestion = (): Question => ({
    id: getRandomString(),
    type: 'QCM',
    text: getRandomString(),
    points: 50,
    choices: [
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
    lastModification: new Date(2024, 1, 1),
});

describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
            ],
            providers: [QuestionService, Logger],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
        questionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        connection = await module.get(getConnectionToken());
        await questionModel.deleteMany({});
    });

    afterEach((done) => {
        setTimeout(async () => {
            await questionModel.deleteMany({});
            await connection.close();
            await mongoServer.stop();
            done();
        }, constants.DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(questionModel).toBeDefined();
    });

    it('start() should populate the database if it is empty', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await questionModel.deleteMany({});
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });

    it('start() should not populate the database if is not empty', async () => {
        const question = getFakeQuestion();
        await questionModel.create(question);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('populateDB() should add 3 new questions', async () => {
        const questionsCountBefore = await questionModel.countDocuments();
        await service.populateDB();
        const questionsCountAfter = await questionModel.countDocuments();
        const expectedCount = 3;
        expect(questionsCountAfter - questionsCountBefore).toEqual(expectedCount);
    });

    it('getAllQuestions() should return all questions in database', async () => {
        await questionModel.deleteMany({});
        expect((await service.getAllQuestions()).length).toEqual(0);
        const question = getFakeQuestion();
        await questionModel.create(question);
        expect((await service.getAllQuestions()).length).toEqual(1);
    });

    it('getQuestionById() should return Question with the corresponding ID', async () => {
        const question = getFakeQuestion();
        await questionModel.create(question);
        const returnedQuestion = await service.getQuestionById(question.id);
        expect(stringifyPublicValues(returnedQuestion)).toEqual(stringifyPublicValues(question));
    });

    it('updateQuestion() should fail if the corresponding question does not exist in the database', async () => {
        const question = getFakeQuestion();
        await expect(service.updateQuestion(question)).rejects.toBeTruthy();
    });

    it('updateQuestion() should fail if Mongo query failed', async () => {
        jest.spyOn(questionModel, 'updateOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await expect(service.updateQuestion(question)).rejects.toBeTruthy();
    });

    it('deleteQuestion() should delete the corresponding question', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await questionModel.create(question);
        await service.deleteQuestion(question.id);
        expect(await questionModel.countDocuments()).toEqual(0);
    });

    it('deleteQuestion() should fail if the question does not exist', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.id)).rejects.toBeTruthy();
    });

    it('deleteQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.id)).rejects.toBeTruthy();
    });
    it('addQuestion() should add the question to the database', async () => {
        await questionModel.deleteMany({});
        const question = getFakeQuestion();
        await service.addQuestion({ ...question }); // TODO: See if it requires adjustements
        expect(await questionModel.countDocuments()).toEqual(1);
    });

    it('addQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const question = getFakeQuestion();
        await expect(service.addQuestion({ ...question })).rejects.toBeTruthy();
    });
});

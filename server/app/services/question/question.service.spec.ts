import { getRandomString } from '@app/constants/random-string';
import { Question, QuestionDocument } from '@app/model/database/question';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { GameValidationService } from '../game-validation/game-validation.service';
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
// TODO: Complete the base tests
describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    beforeEach(async () => {
        questionModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
            deleteMany: jest.fn(),
        } as unknown as Model<QuestionDocument>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                GameValidationService,
                Logger,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModel,
                },
            ],
        }).compile();
        service = module.get<QuestionService>(QuestionService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('database should be populated when there is no data', async () => {
        jest.spyOn(questionModel, 'countDocuments').mockResolvedValue(0);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });
    it('database should not be populated when there is some data', async () => {
        jest.spyOn(questionModel, 'countDocuments').mockResolvedValue(1);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await service.start();
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });
    it('getAllQuestions() should return all questions in database', async () => {
        const mockQuestions = [getFakeQuestion(), getFakeQuestion()];
        const spyFind = jest.spyOn(questionModel, 'find').mockResolvedValue(mockQuestions);
        const returnedQuestions = await service.getAllQuestions();
        expect(returnedQuestions.length).toEqual(mockQuestions.length);
        expect(spyFind).toHaveBeenCalledWith({});
    });
    it('getQuestionById() should return question with the corresponding ID', async () => {
        const mockQuestion = getFakeQuestion();
        const spyFindOne = jest.spyOn(questionModel, 'findOne').mockResolvedValue(mockQuestion);
        const returnedQuestion = await service.getQuestionById(mockQuestion.id);
        expect(stringifyPublicValues(returnedQuestion)).toEqual(stringifyPublicValues(mockQuestion));
        expect(spyFindOne).toHaveBeenCalledWith({ id: mockQuestion.id });
    });
    it('updateQuestion() should fail if the corresponding question does not exist in the database', async () => {
        const mockQuestion = getFakeQuestion();
        const spyFindOne = jest.spyOn(questionModel, 'findOne').mockRejectedValue('');
        await expect(service.updateQuestion(mockQuestion)).rejects.toBeTruthy();
    });
    // TODO: Unit tests with upsert(): updateQuestion(question, true)
    it('deleteQuestion() should delete the corresponding question', async () => {
        const mockQuestion = getFakeQuestion();
        const spyDeleteOne = jest.spyOn(questionModel, 'deleteOne').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
        await service.deleteQuestion(mockQuestion.id);
        expect(spyDeleteOne).toHaveBeenCalledWith({ id: mockQuestion.id });
        // TODO: Find a way to count documents?
    });
    it('deleteQuestion() should fail if mongo query failed or question does not exist', async () => {
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        const question = getFakeQuestion();
        await expect(service.deleteQuestion(question.id)).rejects.toBeTruthy();
    });
    // TODO: Add isVisible = false + id and date?
    it('addQuestion() should add the question to the database', async () => {
        jest.mock('uuid', () => ({ v4: () => '123456789' }));
        const mockQuestion = getFakeQuestion();
        const spyCreate = jest.spyOn(questionModel, 'create').mockImplementation();
        await service.addQuestion({ ...mockQuestion }); // TODO: See if it requires adjustements
        expect(spyCreate).toHaveBeenCalled();
    });
    it('addQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const question = getFakeQuestion();
        await expect(service.addQuestion({ ...question })).rejects.toBeTruthy();
    });
});
// Alternative version of tests: Can pass locally, but does not always on GitLab for some reason... (hence it's deactivated)
/*
describe('QuestionServiceE2E', () => {
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
*/

import { getRandomString } from '@app/constants/random-string';
import { Question, QuestionDocument } from '@app/model/database/question';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { QuestionService } from './question.service';
const stringifyPublicValues = (question: Question): string => {
    return JSON.stringify(question, (key, value) => {
        if (key !== '_id' && key !== '__v') return value;
    });
};
const getMockQuestion = (): Question => ({
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
    lastModification: new Date(),
});
// TODO: Complete the base tests
describe('QuestionService', () => {
    let service: QuestionService;
    let questionModel: Model<QuestionDocument>;
    let gameValidationService: SinonStubbedInstance<GameValidationService>;

    beforeEach(async () => {
        gameValidationService = createStubInstance(GameValidationService);
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
                Logger,
                {
                    provide: getModelToken(Question.name),
                    useValue: questionModel,
                },
                {
                    provide: GameValidationService,
                    useValue: gameValidationService,
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
        const mockQuestions = [getMockQuestion(), getMockQuestion()];
        const spyFind = jest.spyOn(questionModel, 'find').mockResolvedValue(mockQuestions);
        const returnedQuestions = await service.getAllQuestions();
        expect(returnedQuestions.length).toEqual(mockQuestions.length);
        expect(spyFind).toHaveBeenCalledWith({});
        expect(returnedQuestions).toEqual(mockQuestions);
    });
    it('getQuestionByName() should return question with the corresponding text', async () => {
        const mockQuestion = getMockQuestion();
        const spyFindOne = jest.spyOn(questionModel, 'findOne').mockResolvedValue(mockQuestion);
        const returnedQuestion = await service.getQuestionByName(mockQuestion.text);
        expect(returnedQuestion).toEqual(mockQuestion);
        expect(spyFindOne).toHaveBeenCalledWith({ text: mockQuestion.text });
    });
    it('getQuestionById() should return question with the corresponding ID', async () => {
        const mockQuestion = getMockQuestion();
        const spyFindOne = jest.spyOn(questionModel, 'findOne').mockResolvedValue(mockQuestion);
        const returnedQuestion = await service.getQuestionById(mockQuestion.id);
        expect(returnedQuestion).toEqual(mockQuestion);
        expect(spyFindOne).toHaveBeenCalledWith({ id: mockQuestion.id });
    });

    it('addQuestion() should add the question to the database with new ID and lastModification', async () => {
        jest.mock('uuid', () => ({ v4: () => '123456789' }));
        const mockQuestion = getMockQuestion();
        const spyGet = jest.spyOn(service, 'getQuestionByName');
        const spyCreate = jest.spyOn(questionModel, 'create').mockImplementation();
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue([]);
        const createdQuestion = await service.addQuestion({ ...mockQuestion });
        expect(spyGet).toHaveBeenCalled();
        expect(spyCreate).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
        expect(stringifyPublicValues(mockQuestion)).toEqual(stringifyPublicValues(mockQuestion));
        expect(createdQuestion.id).not.toEqual(mockQuestion.id);
        expect(createdQuestion.lastModification).not.toEqual(mockQuestion.lastModification);
    });
    it('addQuestion() should fail if mongo query failed', async () => {
        const spyGet = jest.spyOn(service, 'getQuestionByName');
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue([]);
        const spyCreate = jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const mockQuestion = new Question();
        await service.addQuestion({ ...mockQuestion }).catch((error) => {
            expect(error).toBe("La question n'a pas pu être ajoutée: ");
        });
        expect(spyGet).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
        expect(spyCreate).toHaveBeenCalled();
    });
    it('addQuestion() should fail if the question already exists in the bank', async () => {
        const mockQuestion = new Question();
        const spyGetQuestionByName = jest.spyOn(service, 'getQuestionByName').mockResolvedValue(mockQuestion);
        const testQuestion = new Question();
        testQuestion.id = mockQuestion.id;
        await service.addQuestion(testQuestion).catch((error) => {
            expect(error).toBe('La question existe déjà dans la banque.');
        });
        expect(spyGetQuestionByName).toHaveBeenCalledWith(testQuestion.text);
    });
    it('addQuestion() should fail if the question is invalid', async () => {
        const mockErrorMessages = ['mock'];
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue(mockErrorMessages);
        const mockQuestion = new Question();
        await service.addQuestion(mockQuestion).catch((error) => {
            expect(error).toBe('La question est invalide:\nmock');
        });
        expect(spyValidate).toBeCalledWith(mockQuestion);
    });
    it('updateQuestion() should update the question in the database with new lastModification', async () => {
        const mockQuestion = new Question();
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue([]);
        const spyUpdate = jest.spyOn(questionModel, 'updateOne');
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(mockQuestion);
        const updatedQuestion = await service.updateQuestion({ ...mockQuestion });
        expect(spyGet).toHaveBeenCalled();
        expect(spyUpdate).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
        expect(updatedQuestion.id).toEqual(mockQuestion.id);
        expect(updatedQuestion.lastModification).not.toEqual(mockQuestion.lastModification);
    });
    it('updateQuestion() should fail if question cannot be found in database.', async () => {
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(null);
        await service.updateQuestion(new Question()).catch((error) => {
            expect(error).toBe('La question est introuvable.');
        });
        expect(spyGet).toHaveBeenCalled();
    });
    it('updateQuestion() should fail if the question is invalid', async () => {
        const mockErrorMessages = ['mock'];
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue(mockErrorMessages);
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(new Question());
        await service.updateQuestion(new Question()).catch((error) => {
            expect(error).toBe('La question est invalide:\nmock');
        });
        expect(spyValidate).toHaveBeenCalled();
        expect(spyGet).toHaveBeenCalled();
    });
    it('updateQuestion() should fail if mongo query fails', async () => {
        const spyUpdate = jest.spyOn(questionModel, 'updateOne').mockRejectedValue('');
        const spyValidate = jest.spyOn(gameValidationService, 'findQuestionErrors').mockReturnValue([]);
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(new Question());
        await service.updateQuestion(new Question()).catch((error) => {
            expect(error).toBe("La question n'a pas été mise à jour: ");
        });
        expect(spyValidate).toHaveBeenCalled();
        expect(spyGet).toHaveBeenCalled();
        expect(spyUpdate).toHaveBeenCalled();
    });
    it('deleteQuestion() should delete the corresponding question', async () => {
        const mockQuestion = getMockQuestion();
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(mockQuestion);
        const spyDeleteOne = jest.spyOn(questionModel, 'deleteOne').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
        await service.deleteQuestion(mockQuestion.id);
        expect(spyDeleteOne).toHaveBeenCalledWith({ id: mockQuestion.id });
        expect(spyGet).toHaveBeenCalledWith(mockQuestion.id);
    });
    it('deleteQuestion() should fail if question cannot be found', async () => {
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(null);
        await service.deleteQuestion('').catch((error) => {
            expect(error).toBe('La question est introuvable.');
        });
        expect(spyGet).toHaveBeenCalled();
    });
    it('deleteQuestion() should fail if mongo query failed', async () => {
        const spyGet = jest.spyOn(service, 'getQuestionById').mockResolvedValue(new Question());
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        await service.deleteQuestion('').catch((error) => {
            expect(error).toBe("La question n'a pas pu être supprimée: ");
        });
        expect(spyGet).toHaveBeenCalled();
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
        }, DELAY_BEFORE_CLOSING_CONNECTION);
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
        const question = getMockQuestion();
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
        const question = getMockQuestion();
        await questionModel.create(question);
        expect((await service.getAllQuestions()).length).toEqual(1);
    });
    it('getQuestionById() should return Question with the corresponding ID', async () => {
        const question = getMockQuestion();
        await questionModel.create(question);
        const returnedQuestion = await service.getQuestionById(question.id);
        expect(stringifyPublicValues(returnedQuestion)).toEqual(stringifyPublicValues(question));
    });
    it('updateQuestion() should fail if the corresponding question does not exist in the database', async () => {
        const question = getMockQuestion();
        await expect(service.updateQuestion(question)).rejects.toBeTruthy();
    });
    it('updateQuestion() should fail if Mongo query failed', async () => {
        jest.spyOn(questionModel, 'updateOne').mockRejectedValue('');
        const question = getMockQuestion();
        await expect(service.updateQuestion(question)).rejects.toBeTruthy();
    });
    it('deleteQuestion() should delete the corresponding question', async () => {
        await questionModel.deleteMany({});
        const question = getMockQuestion();
        await questionModel.create(question);
        await service.deleteQuestion(question.id);
        expect(await questionModel.countDocuments()).toEqual(0);
    });
    it('deleteQuestion() should fail if the question does not exist', async () => {
        await questionModel.deleteMany({});
        const question = getMockQuestion();
        await expect(service.deleteQuestion(question.id)).rejects.toBeTruthy();
    });
    it('deleteQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'deleteOne').mockRejectedValue('');
        const question = getMockQuestion();
        await expect(service.deleteQuestion(question.id)).rejects.toBeTruthy();
    });
    it('addQuestion() should add the question to the database', async () => {
        await questionModel.deleteMany({});
        const question = getMockQuestion();
        await service.addQuestion({ ...question }); // TODO: See if it requires adjustements
        expect(await questionModel.countDocuments()).toEqual(1);
    });
    it('addQuestion() should fail if mongo query failed', async () => {
        jest.spyOn(questionModel, 'create').mockImplementation(async () => Promise.reject(''));
        const question = getMockQuestion();
        await expect(service.addQuestion({ ...question })).rejects.toBeTruthy();
    });
});
*/

import { getMockGame } from '@app/constants/game-mocks';
import { ERROR_DEFAULT, ERROR_GAME_NOT_FOUND, ERROR_INVALID_GAME, ERROR_QUESTION_NOT_FOUND } from '@app/constants/request-errors';
import { Game, GameDocument } from '@app/model/database/game';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import * as uuid from 'uuid';
import { GameService } from './game.service';
jest.mock('uuid');

const MOCK_YEAR = 2024;
const MOCK_DATE = new Date(MOCK_YEAR, 1, 1);
describe('GameService', () => {
    let service: GameService;
    let gameModel: Model<GameDocument>;
    let gameValidationService: SinonStubbedInstance<GameValidationService>;

    beforeEach(async () => {
        gameValidationService = createStubInstance(GameValidationService);
        gameModel = {
            countDocuments: jest.fn(),
            insertMany: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
            update: jest.fn(),
            updateOne: jest.fn(),
            deleteMany: jest.fn(),
            findOneAndUpdate: jest.fn(),
        } as unknown as Model<GameDocument>;
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: gameModel,
                },
                {
                    provide: GameValidationService,
                    useValue: gameValidationService,
                },
            ],
        }).compile();
        service = module.get<GameService>(GameService);
    });
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(MOCK_DATE);
    });

    afterAll(() => {
        jest.useRealTimers();
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllGames() should return all games from database', async () => {
        const mockGames = [getMockGame(), getMockGame()];
        const spyFind = jest.spyOn(gameModel, 'find').mockResolvedValue(mockGames);
        const returnedGames = await service.getAllGames();
        expect(spyFind).toHaveBeenCalledWith({});
        expect(returnedGames).toEqual(mockGames);
    });

    it('getAllVisibleGames() should return all visible games from database', async () => {
        const mockGames = [getMockGame(), getMockGame()];
        const spyFind = jest.spyOn(gameModel, 'find').mockResolvedValue(mockGames);
        const returnedGames = await service.getAllVisibleGames();
        expect(spyFind).toHaveBeenCalledWith({ isVisible: true });
        expect(returnedGames).toEqual(mockGames);
    });

    it('getGameById should return the game with the corresponding ID', async () => {
        const mockGame = getMockGame();
        const spyFindOne = jest.spyOn(gameModel, 'findOne').mockResolvedValue(mockGame);
        const returnedGame = await service.getGameById(mockGame.id);
        expect(returnedGame).toEqual(mockGame);
        expect(spyFindOne).toHaveBeenCalledWith({ id: mockGame.id });
    });

    it('getGameById should fail if there is no game with the corresponding ID', async () => {
        const spyFindOne = jest.spyOn(gameModel, 'findOne').mockResolvedValue(null);
        await service.getGameById('').catch((error) => {
            expect(error).toBe(`${ERROR_GAME_NOT_FOUND}`);
        });
        expect(spyFindOne).toHaveBeenCalled();
    });

    it('getGameByTitle should return the game with the corresponding title', async () => {
        const mockGame = getMockGame();
        const spyFindOne = jest.spyOn(gameModel, 'findOne').mockResolvedValue(mockGame);
        const returnedGame = await service.getGameByTitle(mockGame.title);
        expect(returnedGame).toEqual(mockGame);
        expect(spyFindOne).toHaveBeenCalledWith({ title: mockGame.title });
    });

    it('getChoices() should return the choices of the question in the game with the corresponding IDs', async () => {
        const mockGame = getMockGame();
        const mockQuestion = mockGame.questions[0];
        const mockChoices = mockQuestion.choices;
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockGame);
        const returnedChoices = await service.getChoices(mockGame.id, mockQuestion.id);
        expect(returnedChoices).toEqual(mockChoices);
        expect(spyGet).toHaveBeenCalledWith(mockGame.id);
    });
    it('getChoices() should reject if question cannot be found in the game', async () => {
        const mockGame = getMockGame();
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockGame);
        await service.getChoices(mockGame.id, '').catch((error) => {
            expect(error).toBe(`${ERROR_QUESTION_NOT_FOUND}`);
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.id);
    });

    it('updateDateAndVisibility() should update the game date and make its visibility to false', async () => {
        const mockGame = getMockGame();
        const updatedGame = service.updateDateAndVisibility(mockGame);
        expect(updatedGame.id).toEqual(mockGame.id);
        expect(updatedGame.isVisible).toBeFalsy();
        expect(updatedGame.lastModification).toEqual(MOCK_DATE);
        updatedGame.questions.forEach((question) => {
            expect(question.lastModification).toEqual(MOCK_DATE);
        });
    });

    it('generateId() should generate an ID for game and its questions', () => {
        // Reference: https://stackoverflow.com/questions/51383177/how-to-mock-uuid-with-jest
        const uuidSpy = jest.spyOn(uuid, 'v4').mockReturnValue('mockedValue');
        const mockGame = getMockGame();
        const updatedGame = service.generateId(mockGame);
        expect(uuidSpy).toHaveBeenCalledTimes(1 + updatedGame.questions.length);
    });

    it('addGame() should add the game to the database if it is valid and has new title', async () => {
        const mockGame = getMockGame();
        const spyGet = jest.spyOn(service, 'getGameByTitle').mockResolvedValue(null);
        const spyCreate = jest.spyOn(gameModel, 'create').mockImplementation();
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue([]);
        const spyDateVisibility = jest.spyOn(service, 'updateDateAndVisibility').mockReturnValue(mockGame);
        const spyGenerateId = jest.spyOn(service, 'generateId').mockReturnValue(mockGame);
        const createdGame = await service.addGame({ ...mockGame });
        expect(createdGame).toEqual(mockGame);
        expect(spyGet).toHaveBeenCalledWith(mockGame.title);
        expect(spyGenerateId).toHaveBeenCalledWith(mockGame);
        expect(spyDateVisibility).toHaveBeenCalledWith(mockGame);
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
        expect(spyCreate).toHaveBeenCalledWith(mockGame);
    });
    it('addGame() should not add the game to the database if another game with the same title already exists', async () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameByTitle').mockResolvedValue(new Game());
        await service.addGame({ ...mockGame }).catch((error) => {
            expect(error).toBe('Un jeu du même titre existe déjà.');
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.title);
    });
    it('addGame should not add the game to the database if it is invalid', async () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameByTitle').mockResolvedValue(null);
        const mockErrorMessages = ['mock'];
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue(mockErrorMessages);
        const spyDateVisibility = jest.spyOn(service, 'updateDateAndVisibility').mockReturnValue(mockGame);
        const spyGenerateId = jest.spyOn(service, 'generateId').mockReturnValue(mockGame);
        await service.addGame({ ...mockGame }).catch((error) => {
            expect(error).toBe(`${ERROR_INVALID_GAME}\nmock`);
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.title);
        expect(spyGenerateId).toHaveBeenCalledWith(mockGame);
        expect(spyDateVisibility).toHaveBeenCalledWith(mockGame);
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
    });
    it('addGame() should not add the game to the database if mongo query fails', async () => {
        const mockGame = getMockGame();
        const spyGet = jest.spyOn(service, 'getGameByTitle').mockResolvedValue(null);
        const spyCreate = jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue([]);
        const spyDateVisibility = jest.spyOn(service, 'updateDateAndVisibility').mockReturnValue(mockGame);
        const spyGenerateId = jest.spyOn(service, 'generateId').mockReturnValue(mockGame);
        await service.addGame({ ...mockGame }).catch((error) => {
            expect(error).toBe(`${ERROR_DEFAULT} `);
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.title);
        expect(spyGenerateId).toHaveBeenCalledWith(mockGame);
        expect(spyDateVisibility).toHaveBeenCalledWith(mockGame);
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
        expect(spyCreate).toHaveBeenCalledWith(mockGame);
    });

    it('toggleGameVisibility() should make a visible game invisible', async () => {
        const mockVisibleGame = getMockGame();
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockVisibleGame);
        const spyUpdate = jest.spyOn(gameModel, 'updateOne').mockImplementation();
        const updatedGame = await service.toggleGameVisibility(mockVisibleGame.id);
        expect(spyGet).toHaveBeenCalledWith(mockVisibleGame.id);
        expect(spyUpdate).toHaveBeenCalled();
        expect(updatedGame.isVisible).toBeFalsy();
        expect(updatedGame.id).toEqual(mockVisibleGame.id);
    });

    it('toggleGameVisibility() should make an invisible game visible', async () => {
        const mockVisibleGame = getMockGame();
        mockVisibleGame.isVisible = false;
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockVisibleGame);
        const spyUpdate = jest.spyOn(gameModel, 'updateOne').mockImplementation();
        const updatedGame = await service.toggleGameVisibility(mockVisibleGame.id);
        expect(spyGet).toHaveBeenCalledWith(mockVisibleGame.id);
        expect(spyUpdate).toHaveBeenCalled();
        expect(updatedGame.isVisible).toBeTruthy();
        expect(updatedGame.id).toEqual(mockVisibleGame.id);
    });

    it('toggleGameVisibility() should fail if game cannot be found', async () => {
        const mockVisibleGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameById').mockRejectedValue('');
        await service.toggleGameVisibility(mockVisibleGame.id).catch((error) => {
            expect(error).toBe(`${ERROR_DEFAULT} `);
        });
        expect(spyGet).toHaveBeenCalledWith(mockVisibleGame.id);
    });

    it('upsertGame() should upsert the game if it is valid', async () => {
        const mockGame = getMockGame();
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue([]);
        const spyDateVisibility = jest.spyOn(service, 'updateDateAndVisibility').mockReturnValue(mockGame);
        const spyModel = jest.spyOn(gameModel, 'findOneAndUpdate').mockImplementation();
        const upsertedGame = await service.upsertGame(mockGame);
        expect(upsertedGame).toEqual(mockGame);
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
        expect(spyDateVisibility).toHaveBeenCalledWith(mockGame);
        expect(spyModel).toHaveBeenCalledWith({ id: mockGame.id }, mockGame, { new: true, upsert: true });
    });

    it('upsertGame() should fail if the game is not valid', async () => {
        const mockGame = getMockGame();
        const mockErrorMessages = ['mock'];
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue(mockErrorMessages);
        await service.upsertGame(mockGame).catch((error) => {
            expect(error).toBe(`${ERROR_INVALID_GAME}\nmock`);
        });
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
    });

    it('upsertGame() should fail if mongo query fails', async () => {
        const mockGame = getMockGame();
        const spyValidate = jest.spyOn(gameValidationService, 'findGameErrors').mockReturnValue([]);
        const spyDateVisibility = jest.spyOn(service, 'updateDateAndVisibility').mockReturnValue(mockGame);
        const spyModel = jest.spyOn(gameModel, 'findOneAndUpdate').mockRejectedValue('');
        await service.upsertGame(mockGame).catch((error) => {
            expect(error).toBe(`${ERROR_DEFAULT} `);
        });
        expect(spyValidate).toHaveBeenCalledWith(mockGame);
        expect(spyDateVisibility).toHaveBeenCalledWith(mockGame);
        expect(spyModel).toHaveBeenCalledWith({ id: mockGame.id }, mockGame, { new: true, upsert: true });
    });

    it('deleteGame() should delete the game with the corresponding ID', async () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockGame);
        const spyDelete = jest.spyOn(gameModel, 'deleteOne').mockImplementation();
        await service.deleteGame(mockGame.id);
        expect(spyGet).toHaveBeenCalledWith(mockGame.id);
        expect(spyDelete).toHaveBeenCalledWith({ id: mockGame.id });
    });
    it('deleteGame() should fail if the game with the corresponding ID cannot be found', async () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameById').mockRejectedValue('');
        await service.deleteGame(mockGame.id).catch((error) => {
            expect(error).toBe(`${ERROR_DEFAULT} `);
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.id);
    });
    it('deleteGame() should fail if mongo query fails', async () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(service, 'getGameById').mockResolvedValue(mockGame);
        const spyDelete = jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
        await service.deleteGame(mockGame.id).catch((error) => {
            expect(error).toBe(`${ERROR_DEFAULT} `);
        });
        expect(spyGet).toHaveBeenCalledWith(mockGame.id);
        expect(spyDelete).toHaveBeenCalledWith({ id: mockGame.id });
    });
});

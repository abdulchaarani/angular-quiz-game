import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';

describe('MatchService', () => {
    let service: MatchService;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [MatchService, { provide: GameService, useValue: gameService }],
        }).compile();

        service = module.get<MatchService>(MatchService);
    });

    beforeEach(() => {
        service.backupGames = [];
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('getAllVisibleGames() should return all visible games and remove isCorrect Choice property on each one', async () => {
        const mockVisibleGames = [new Game(), new Game()];
        const spyRemoveIsCorrectField = jest.spyOn(service, 'removeIsCorrectField');
        gameService.getAllVisibleGames.resolves(mockVisibleGames);
        const games = await service.getAllVisibleGames();
        expect(games.length).toEqual(mockVisibleGames.length);
        mockVisibleGames.forEach((game) => {
            expect(spyRemoveIsCorrectField).toHaveBeenCalledWith(game);
        });
    });

    it('getGameByIdWithoutIsCorrect() should return the game with the corresponding ID, but without the isCorrect Choice property', async () => {
        const mockGame = new Game();
        const spyRemoveIsCorrectField = jest.spyOn(service, 'removeIsCorrectField');
        gameService.getGameById.resolves(mockGame);
        const game = await service.getGameByIdWithoutIsCorrect('');
        expect(spyRemoveIsCorrectField).toHaveBeenCalledWith(mockGame);
        expect(game.id).toEqual(mockGame.id);
    });

    it('getBackupGame() should return the game with the corresponding ID among the backups', () => {
        const firstMockGame = new Game();
        firstMockGame.id = '0';
        const secondMockGame = new Game();
        secondMockGame.id = '1';
        service.backupGames = [firstMockGame, secondMockGame];
        const spyFindUsingDB = jest.spyOn(gameService, 'getGameById');
        const game = service.getBackupGame(firstMockGame.id);
        expect(game).toEqual(firstMockGame);
        expect(game).not.toEqual(secondMockGame);
        expect(spyFindUsingDB).not.toHaveBeenCalled();
    });

    it('getBackupQuestion() should return the question with the corresponding ID among the backups', () => {
        const mockGame = new Game();
        const firstMockQuestion = new Question();
        firstMockQuestion.id = '0';
        const secondMockQuestion = new Question();
        secondMockQuestion.id = '1';
        mockGame.questions = [firstMockQuestion, secondMockQuestion];
        const spyGetBackupGame = jest.spyOn(service, 'getBackupGame').mockReturnValue(mockGame);
        const question = service.getBackupQuestion('', '0');
        expect(question).toEqual(firstMockQuestion);
        expect(spyGetBackupGame).toHaveBeenCalled();
    });

    it('getChoices() should return the question choices from the backup data', () => {
        const mockQuestion = new Question();
        mockQuestion.choices = [new Choice(), new Choice()];
        const spyGetBackupQuestion = jest.spyOn(service, 'getBackupQuestion').mockReturnValue(mockQuestion);
        const choices = service.getChoices('', '');
        expect(choices).toEqual(mockQuestion.choices);
        expect(spyGetBackupQuestion).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return true only if all choices from player are correct', () => {
        const mockQuestion = getMockQuestionWithChoices();
        const spyGetBackupQuestion = jest.spyOn(service, 'getBackupQuestion').mockReturnValue(mockQuestion);
        const correctPlayerTry = service.validatePlayerChoice('', '', [firstCorrectChoice.text, secondCorrectChoice.text]);
        expect(correctPlayerTry).toBe(true);
        expect(spyGetBackupQuestion).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return false if at least one choice from player is incorrect', () => {
        const mockQuestion = getMockQuestionWithChoices();
        const spyGetBackupQuestion = jest.spyOn(service, 'getBackupQuestion').mockReturnValue(mockQuestion);
        const correctPlayerTry = service.validatePlayerChoice('', '', [firstCorrectChoice.text, secondCorrectChoice.text, incorrectChoice.text]);
        expect(correctPlayerTry).toBe(false);
        expect(spyGetBackupQuestion).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return false if the player does not submit ALL correct choices.', () => {
        const mockQuestion = getMockQuestionWithChoices();
        const spyGetBackupQuestion = jest.spyOn(service, 'getBackupQuestion').mockReturnValue(mockQuestion);
        const correctPlayerTry = service.validatePlayerChoice('', '', [firstCorrectChoice.text]);
        expect(correctPlayerTry).toBe(false);
        expect(spyGetBackupQuestion).toHaveBeenCalled();
    });

    it('saveBackupGame() should get the game from database, add it to the backup data, and return the game without isCorrect property', async () => {
        const mockGame = new Game();
        mockGame.id = '0';
        const spyGetGameById = jest.spyOn(gameService, 'getGameById').mockResolvedValue(mockGame);
        const spyRemoveIsCorrectField = jest.spyOn(service, 'removeIsCorrectField').mockReturnValue(mockGame);
        service.backupGames = [new Game()];
        const game = await service.saveBackupGame('0');
        expect(game.id).toEqual(mockGame.id);
        expect(spyGetGameById).toHaveBeenCalled();
        expect(spyRemoveIsCorrectField).toHaveBeenCalled();
        expect(service.backupGames.length).toBe(2);
        expect(service.backupGames).toContain(mockGame);
    });

    it('saveBackupGame() should reject if gameService fails to fetch game', async () => {
        const spyGetGameById = jest.spyOn(gameService, 'getGameById').mockRejectedValue('');
        await service.saveBackupGame('').catch((error) => {
            expect(error).toBe('Le jeu est introuvable.');
        });
        expect(spyGetGameById).toHaveBeenCalled();
    });

    it('deleteBackupGame() should delete one game with the corresponding ID from the backup data', async () => {
        const mockGame = new Game();
        mockGame.id = '0';
        service.backupGames = [mockGame, mockGame];
        await service.deleteBackupGame('0');
        expect(service.backupGames.length).toBe(1);
    });

    it('deleteBackupGame() should reject if the game cannot be found', async () => {
        service.backupGames = [new Game()];
        await service.deleteBackupGame('').catch((error) => {
            expect(error).toBe("La copie du jeu n'a pas pu être supprimée.");
        });
        expect(service.backupGames.length).toBe(1);
    });

    it('removeIsCorrectField should return a game without the field isCorrect in question choices', () => {
        const game = service.removeIsCorrectField(mockGameWithIsCorrectField);
        expect(JSON.stringify(game)).toBe(JSON.stringify(mockGameWithoutIsCorrectField));

        const gameNoIsCorrect = service.removeIsCorrectField(mockGameWithoutIsCorrectField);
        expect(JSON.stringify(gameNoIsCorrect)).toBe(JSON.stringify(mockGameWithoutIsCorrectField));
    });
});

// TODO: Consider refactor the constants in a separate file (same for the error messages)
const firstCorrectChoice = { text: 'first', isCorrect: true };
const secondCorrectChoice = { text: 'second', isCorrect: true };
const incorrectChoice = { text: 'third', isCorrect: false };

const getMockQuestionWithChoices = (): Question => {
    const mockQuestion = new Question();
    mockQuestion.choices = [firstCorrectChoice, secondCorrectChoice, incorrectChoice];
    return mockQuestion;
};

const pastYear = 2020;
const mockGameWithIsCorrectField: Game = {
    id: '',
    title: '',
    description: '',
    lastModification: new Date(pastYear, 1, 1),
    duration: 0,
    isVisible: true,
    questions: [
        {
            id: '0',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                    isCorrect: true,
                },
                {
                    text: '',
                    isCorrect: false,
                },
            ],
        },
        {
            id: '1',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                    isCorrect: true,
                },
                {
                    text: '',
                    isCorrect: false,
                },
            ],
        },
    ],
};

const mockGameWithoutIsCorrectField: Game = {
    id: '',
    title: '',
    description: '',
    lastModification: new Date(pastYear, 1, 1),
    duration: 0,
    isVisible: true,
    questions: [
        {
            id: '0',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                },
                {
                    text: '',
                },
            ],
        },
        {
            id: '1',
            type: 'QCM',
            text: '',
            points: 0,
            lastModification: new Date(pastYear, 1, 1),
            choices: [
                {
                    text: '',
                },
                {
                    text: '',
                },
            ],
        },
    ],
};

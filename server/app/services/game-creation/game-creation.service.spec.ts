import { getMockGame } from '@app/constants/game-mocks';
import { Test, TestingModule } from '@nestjs/testing';
import * as uuid from 'uuid';
import { GameCreationService } from './game-creation.service';
jest.mock('uuid');

const MOCK_YEAR = 2024;
const MOCK_DATE = new Date(MOCK_YEAR, 1, 1);
describe('GameCreationService', () => {
    let service: GameCreationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameCreationService],
        }).compile();

        service = module.get<GameCreationService>(GameCreationService);
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
});

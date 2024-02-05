import { errorMessage } from '@app/constants/game-error-messages';
import { constants } from '@app/constants/game-validation-constants';
import { getRandomString } from '@app/constants/random-string';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { Test, TestingModule } from '@nestjs/testing';
import { GameValidationService } from './game-validation.service';
describe('GameValidationService', () => {
    let service: GameValidationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GameValidationService],
        }).compile();

        service = module.get<GameValidationService>(GameValidationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('isValidString() should return false if the string is only made of whitespace; else true', () => {
        const invalidNullString = '';
        const invalidSpaceString = ' ';
        expect(service.isValidString(invalidNullString)).toBeFalsy();
        expect(service.isValidString(invalidSpaceString)).toBeFalsy();
    });
    it('isValidString() should return true if the string is not made only of whitespace', () => {
        const validString = 'abc';
        const validStringWithSpace = 'abc abc';
        expect(service.isValidString(validString)).toBeTruthy();
        expect(service.isValidString(validStringWithSpace)).toBeTruthy();
    });

    it('isValidRange() should return true if the quantity is in the range and respects step if passed as parameter, else false', () => {
        const minimum = -5;
        const maximum = 5;
        const validTestNumber = 4;
        const invalidStepNumber = 3;
        const step = 2;
        const inferiorTestNumber = -10;
        const superiorTestNumber = 10;

        // Without Step:
        expect(service.isValidRange(validTestNumber, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(invalidStepNumber, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(inferiorTestNumber, minimum, maximum)).toBeFalsy();
        expect(service.isValidRange(superiorTestNumber, minimum, maximum)).toBeFalsy();
        expect(service.isValidRange(minimum, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(maximum, minimum, maximum)).toBeTruthy();

        // With Step:
        expect(service.isValidRange(validTestNumber, minimum, maximum, step)).toBeTruthy();
        expect(service.isValidRange(invalidStepNumber, minimum, maximum, step)).toBeFalsy();
        expect(service.isValidRange(inferiorTestNumber, minimum, maximum, step)).toBeFalsy();
        expect(service.isValidRange(superiorTestNumber, minimum, maximum, step)).toBeFalsy();
        expect(service.isValidRange(minimum, minimum, maximum, step)).toBeFalsy();
        expect(service.isValidRange(maximum, minimum, maximum, step)).toBeFalsy();
    });

    it('isValidChoicesRatio() should return true only if there is at least one good choice and one wrong choice', () => {
        expect(service.isValidChoicesRatio(MOCK_QUESTION)).toBeTruthy();
        expect(service.isValidChoicesRatio(MOCK_VALID_FOUR_CHOICES_QUESTION)).toBeTruthy();
        expect(service.isValidChoicesRatio(MOCK_ALL_FALSE_CHOICES_QUESTION)).toBeFalsy();
        expect(service.isValidChoicesRatio(MOCK_ALL_TRUE_CHOICES_QUESTION)).toBeFalsy();
    });

    it('findQuestionErrors() should return an empty array if the question has no error', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => true);
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => true);
        const ratioSpy = jest.spyOn(service, 'isValidChoicesRatio').mockImplementation(() => true);
        expect(service.findQuestionErrors(MOCK_QUESTION)).toEqual([]);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints, constants.stepPoints);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_QUESTION.text);
        expect(ratioSpy).toHaveBeenCalledWith(MOCK_QUESTION);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesNumber if the number of choices is invalid', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesNumber)).toBeTruthy();
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
    });

    it('findQuestionErrors() should return an array containing errorMessage.points if the number of points is invalid', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.points)).toBeTruthy();
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints, constants.stepPoints);
    });

    it('findQuestionErrors() should return an array containing errorMessage.questionEmptyText if the question text is empty', () => {
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.questionEmptyText)).toBeTruthy();
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_QUESTION.text);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesRatio if the choices ratio is invalid', () => {
        const ratioSpy = jest.spyOn(service, 'isValidChoicesRatio').mockImplementation(() => false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesRatio)).toBeTruthy();
        expect(ratioSpy).toHaveBeenCalledWith(MOCK_QUESTION);
    });

    it('findQuestionErrors() should return an array with all the question errors', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => false);
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => false);
        const ratioSpy = jest.spyOn(service, 'isValidChoicesRatio').mockImplementation(() => false);
        expect(service.findQuestionErrors(MOCK_QUESTION)).toEqual([
            errorMessage.choicesNumber,
            errorMessage.points,
            errorMessage.questionEmptyText,
            errorMessage.choicesRatio,
        ]);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints, constants.stepPoints);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_QUESTION.text);
        expect(ratioSpy).toHaveBeenCalledWith(MOCK_QUESTION);
    });

    it('findGameErrors() should return an empty array if the game is valid', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => true);
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => true);
        const validateQuestionSpy = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => []);
        expect(service.findGameErrors(MOCK_GAME)).toEqual([]);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.title);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.description);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
        expect(validateQuestionSpy).toHaveBeenCalledTimes(MOCK_GAME.questions.length);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyTitle if title is empty', () => {
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyTitle));
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.title);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyDescription if description is empty', () => {
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyDescription));
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.description);
    });

    it('findGameErrors() should return an array containing errorMessage.gameDuration if duration is invalid', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameDuration));
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
    });

    it('findGameErrors() should return an array containing errorMessage.gameQuestionsNumber if it contains no question', () => {
        const testNoQuestionGame = MOCK_GAME;
        testNoQuestionGame.questions = [];
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameQuestionsNumber));
    });

    it('findGameErrors() should return an array containing all errors from invalid questions', () => {
        const validateQuestionSpy = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => [errorMessage.questionEmptyText]);

        const invalidQuestionsGame = MOCK_GAME;
        invalidQuestionsGame.questions = [];
        for (let i = 0; i < 2; i++) {
            invalidQuestionsGame.questions.push(MOCK_QUESTION);
        }

        const foundErrors = service.findGameErrors(invalidQuestionsGame);

        const firstQuestionErrorMessage = 'La question 1 est invalide:';
        const secondQuestionErrorMessage = 'La question 2 est invalide:';

        expect(foundErrors).toEqual([
            firstQuestionErrorMessage,
            errorMessage.questionEmptyText,
            secondQuestionErrorMessage,
            errorMessage.questionEmptyText,
        ]);
        expect(validateQuestionSpy).toHaveBeenCalledTimes(invalidQuestionsGame.questions.length);
    });

    it('findGameErrors() should return an array containing all game errors', () => {
        const rangeSpy = jest.spyOn(service, 'isValidRange').mockImplementation(() => false);
        const validateStringSpy = jest.spyOn(service, 'isValidString').mockImplementation(() => false);
        const validateQuestionSpy = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => []);
        expect(service.findGameErrors(MOCK_GAME)).toEqual([
            errorMessage.gameEmptyTitle,
            errorMessage.gameEmptyDescription,
            errorMessage.gameDuration,
        ]);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.title);
        expect(validateStringSpy).toHaveBeenCalledWith(MOCK_GAME.description);
        expect(rangeSpy).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
        expect(validateQuestionSpy).toHaveBeenCalledTimes(MOCK_GAME.questions.length);
    });
});

const MOCK_QUESTION: Question = {
    id: getRandomString(),
    type: 'QCM',
    points: 10,
    text: getRandomString(),
    lastModification: new Date(),
    choices: [
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
};

const MOCK_VALID_FOUR_CHOICES_QUESTION: Question = {
    id: getRandomString(),
    type: 'QCM',
    points: 10,
    text: getRandomString(),
    lastModification: new Date(),
    choices: [
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
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
};

const MOCK_ALL_TRUE_CHOICES_QUESTION: Question = {
    id: getRandomString(),
    type: 'QCM',
    points: 10,
    text: getRandomString(),
    lastModification: new Date(),
    choices: [
        {
            text: getRandomString(),
            isCorrect: true,
        },
        {
            text: getRandomString(),
            isCorrect: true,
        },
    ],
};

const MOCK_ALL_FALSE_CHOICES_QUESTION: Question = {
    id: getRandomString(),
    type: 'QCM',
    points: 10,
    text: getRandomString(),
    lastModification: new Date(),
    choices: [
        {
            text: getRandomString(),
            isCorrect: false,
        },
        {
            text: getRandomString(),
            isCorrect: false,
        },
    ],
};

const MOCK_GAME: Game = {
    id: getRandomString(),
    title: getRandomString(),
    description: getRandomString(),
    duration: 30,
    isVisible: false,
    lastModification: new Date(),
    questions: [MOCK_QUESTION],
};

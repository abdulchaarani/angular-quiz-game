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

    it('isValidRange() should return true only if the quantity is in the range', () => {
        const minimum = -5;
        const maximum = 5;
        const validTestNumber = 4;
        const invalidStepNumber = 3;
        const inferiorTestNumber = -10;
        const superiorTestNumber = 10;

        // Without Step:
        expect(service.isValidRange(validTestNumber, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(invalidStepNumber, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(inferiorTestNumber, minimum, maximum)).toBeFalsy();
        expect(service.isValidRange(superiorTestNumber, minimum, maximum)).toBeFalsy();
        expect(service.isValidRange(minimum, minimum, maximum)).toBeTruthy();
        expect(service.isValidRange(maximum, minimum, maximum)).toBeTruthy();
    });

    it('isValidChoicesRatio() should return true only if there is at least one good choice and one wrong choice', () => {
        expect(service.isValidChoicesRatio(MOCK_QUESTION)).toBeTruthy();
        expect(service.isValidChoicesRatio(MOCK_VALID_FOUR_CHOICES_QUESTION)).toBeTruthy();
        expect(service.isValidChoicesRatio(MOCK_ALL_FALSE_CHOICES_QUESTION)).toBeFalsy();
        expect(service.isValidChoicesRatio(MOCK_ALL_TRUE_CHOICES_QUESTION)).toBeFalsy();
    });
    it('isUniqueChoices() should return true only if all choices texts are unique and not duplicated', () => {
        const uniqueChoices = [{ text: 'a' }, { text: 'b' }];
        const repeatChoices = [{ text: 'a' }, { text: 'b' }, { text: 'a' }];
        expect(service.isUniqueChoices(uniqueChoices)).toBeTruthy();
        expect(service.isUniqueChoices(repeatChoices)).toBeFalsy();
    });
    it('findQuestionErrors() should return an empty array if the question has no error', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(true);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(true);
        const spyChoicesRatio = jest.spyOn(service, 'isValidChoicesRatio').mockReturnValue(true);
        const spyUniqueChoices = jest.spyOn(service, 'isUniqueChoices').mockReturnValue(true);
        expect(service.findQuestionErrors(MOCK_QUESTION)).toEqual([]);
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_QUESTION.text);
        expect(spyChoicesRatio).toHaveBeenCalledWith(MOCK_QUESTION);
        expect(spyUniqueChoices).toHaveBeenCalledWith(MOCK_QUESTION.choices);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesNumber if the number of choices is invalid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesNumber)).toBeTruthy();
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
    });

    it('findQuestionErrors() should return an array containing errorMessage.noRepeatChoice if there are duplicate choices', () => {
        const spyUniqueChoices = jest.spyOn(service, 'isUniqueChoices').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.noRepeatChoice)).toBeTruthy();
        expect(spyUniqueChoices).toHaveBeenCalledWith(MOCK_QUESTION.choices);
    });

    it('findQuestionErrors() should return an array containing errorMessage.points if the number of points is not in correct range', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.points)).toBeTruthy();
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints);
    });

    it('findQuestionErrors() should return array containing errorMessage.points if number of points is not correct multiple', () => {
        const testWrongPointsQuestion = MOCK_QUESTION;
        testWrongPointsQuestion.points = 55;
        const foundErrors = service.findQuestionErrors(testWrongPointsQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.points)).toBeTruthy();
    });

    it('findQuestionErrors() should return an array containing errorMessage.questionEmptyText if the question text is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.questionEmptyText)).toBeTruthy();
        expect(spyValidString).toHaveBeenCalledWith(MOCK_QUESTION.text);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesRatio if the choices ratio is invalid', () => {
        const spyChoicesRatio = jest.spyOn(service, 'isValidChoicesRatio').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(MOCK_QUESTION);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesRatio)).toBeTruthy();
        expect(spyChoicesRatio).toHaveBeenCalledWith(MOCK_QUESTION);
    });

    it('findQuestionErrors() should return an array with all the question errors', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const spyChoicesRatio = jest.spyOn(service, 'isValidChoicesRatio').mockReturnValue(false);
        const spyUniqueChoices = jest.spyOn(service, 'isUniqueChoices').mockReturnValue(false);
        expect(service.findQuestionErrors(MOCK_QUESTION)).toEqual([
            errorMessage.choicesNumber,
            errorMessage.noRepeatChoice,
            errorMessage.points,
            errorMessage.questionEmptyText,
            errorMessage.choicesRatio,
        ]);
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
        expect(spyRange).toHaveBeenCalledWith(MOCK_QUESTION.points, constants.minimumPoints, constants.maximumPoints);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_QUESTION.text);
        expect(spyChoicesRatio).toHaveBeenCalledWith(MOCK_QUESTION);
        expect(spyUniqueChoices).toHaveBeenCalledWith(MOCK_QUESTION.choices);
    });

    it('findGameErrors() should return an empty array if the game is valid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(true);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(true);
        const spyValidateQuestion = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => []);
        expect(service.findGameErrors(MOCK_GAME)).toEqual([]);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.title);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.description);
        expect(spyRange).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
        expect(spyValidateQuestion).toHaveBeenCalledTimes(MOCK_GAME.questions.length);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyTitle if title is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyTitle));
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.title);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyDescription if description is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyDescription));
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.description);
    });

    it('findGameErrors() should return an array containing errorMessage.gameDuration if duration is invalid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameDuration));
        expect(spyRange).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
    });

    it('findGameErrors() should return an array containing errorMessage.gameQuestionsNumber if it contains no question', () => {
        const testNoQuestionGame = MOCK_GAME;
        testNoQuestionGame.questions = [];
        const foundErrors = service.findGameErrors(MOCK_GAME);
        expect(foundErrors.find((message: string) => message === errorMessage.gameQuestionsNumber));
    });

    it('findGameErrors() should return an array containing all errors from invalid questions', () => {
        const spyValidateQuestion = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => [errorMessage.questionEmptyText]);

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
        expect(spyValidateQuestion).toHaveBeenCalledTimes(invalidQuestionsGame.questions.length);
    });

    it('findGameErrors() should return an array containing all game errors', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const spyValidateQuestion = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => []);
        expect(service.findGameErrors(MOCK_GAME)).toEqual([
            errorMessage.gameEmptyTitle,
            errorMessage.gameEmptyDescription,
            errorMessage.gameDuration,
        ]);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.title);
        expect(spyValidString).toHaveBeenCalledWith(MOCK_GAME.description);
        expect(spyRange).toHaveBeenCalledWith(MOCK_GAME.duration, constants.minimumDuration, constants.maximumDuration);
        expect(spyValidateQuestion).toHaveBeenCalledTimes(MOCK_GAME.questions.length);
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
            text: 'a',
            isCorrect: true,
        },
        {
            text: 'b',
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

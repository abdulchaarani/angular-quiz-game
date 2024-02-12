import { errorMessage } from '@app/constants/game-error-messages';
import { gameMocks } from '@app/constants/game-mocks';
import { MAX_CHOICES_NUMBER, MAX_DURATION, MAX_POINTS, MIN_CHOICES_NUMBER, MIN_DURATION, MIN_POINTS } from '@app/constants/game-validation-constants';
import { questionMocks } from '@app/constants/question-mocks';
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
        expect(service.isValidChoicesRatio(questionMocks.validQuestion)).toBeTruthy();
        expect(service.isValidChoicesRatio(questionMocks.fourChoicesQuestion)).toBeTruthy();
        expect(service.isValidChoicesRatio(questionMocks.allFalseQuestion)).toBeFalsy();
        expect(service.isValidChoicesRatio(questionMocks.allTrueQuestion)).toBeFalsy();
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
        expect(service.findQuestionErrors(questionMocks.validQuestion)).toEqual([]);
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.choices.length, MIN_CHOICES_NUMBER, MAX_CHOICES_NUMBER);
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.points, MIN_POINTS, MAX_POINTS);
        expect(spyValidString).toHaveBeenCalledWith(questionMocks.validQuestion.text);
        expect(spyChoicesRatio).toHaveBeenCalledWith(questionMocks.validQuestion);
        expect(spyUniqueChoices).toHaveBeenCalledWith(questionMocks.validQuestion.choices);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesNumber if the number of choices is invalid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(questionMocks.validQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesNumber)).toBeTruthy();
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.choices.length, MIN_CHOICES_NUMBER, MAX_CHOICES_NUMBER);
    });

    it('findQuestionErrors() should return an array containing errorMessage.noRepeatChoice if there are duplicate choices', () => {
        const spyUniqueChoices = jest.spyOn(service, 'isUniqueChoices').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(questionMocks.validQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.noRepeatChoice)).toBeTruthy();
        expect(spyUniqueChoices).toHaveBeenCalledWith(questionMocks.validQuestion.choices);
    });

    it('findQuestionErrors() should return an array containing errorMessage.points if the number of points is not in correct range', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(questionMocks.validQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.points)).toBeTruthy();
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.points, MIN_POINTS, MAX_POINTS);
    });

    it('findQuestionErrors() should return array containing errorMessage.points if number of points is not correct multiple', () => {
        const testWrongPointsQuestion = questionMocks.validQuestion;
        testWrongPointsQuestion.points = 55;
        const foundErrors = service.findQuestionErrors(testWrongPointsQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.points)).toBeTruthy();
    });

    it('findQuestionErrors() should return an array containing errorMessage.questionEmptyText if the question text is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(questionMocks.validQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.questionEmptyText)).toBeTruthy();
        expect(spyValidString).toHaveBeenCalledWith(questionMocks.validQuestion.text);
    });

    it('findQuestionErrors() should return an array containing errorMessage.choicesRatio if the choices ratio is invalid', () => {
        const spyChoicesRatio = jest.spyOn(service, 'isValidChoicesRatio').mockReturnValue(false);
        const foundErrors = service.findQuestionErrors(questionMocks.validQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.choicesRatio)).toBeTruthy();
        expect(spyChoicesRatio).toHaveBeenCalledWith(questionMocks.validQuestion);
    });

    it('findQuestionErrors() should return an array with all the question errors', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const spyChoicesRatio = jest.spyOn(service, 'isValidChoicesRatio').mockReturnValue(false);
        const spyUniqueChoices = jest.spyOn(service, 'isUniqueChoices').mockReturnValue(false);
        expect(service.findQuestionErrors(questionMocks.validQuestion)).toEqual([
            errorMessage.choicesNumber,
            errorMessage.noRepeatChoice,
            errorMessage.points,
            errorMessage.questionEmptyText,
            errorMessage.choicesRatio,
        ]);
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.choices.length, MIN_CHOICES_NUMBER, MAX_CHOICES_NUMBER);
        expect(spyRange).toHaveBeenCalledWith(questionMocks.validQuestion.points, MIN_POINTS, MAX_POINTS);
        expect(spyValidString).toHaveBeenCalledWith(questionMocks.validQuestion.text);
        expect(spyChoicesRatio).toHaveBeenCalledWith(questionMocks.validQuestion);
        expect(spyUniqueChoices).toHaveBeenCalledWith(questionMocks.validQuestion.choices);
    });

    it('findGameErrors() should return an empty array if the game is valid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(true);
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(true);
        const spyValidateQuestion = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => []);
        expect(service.findGameErrors(gameMocks.gameValidQuestion)).toEqual([]);
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.title);
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.description);
        expect(spyRange).toHaveBeenCalledWith(gameMocks.gameValidQuestion.duration, MIN_DURATION, MAX_DURATION);
        expect(spyValidateQuestion).toHaveBeenCalledTimes(gameMocks.gameValidQuestion.questions.length);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyTitle if title is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findGameErrors(gameMocks.gameValidQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyTitle));
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.title);
    });

    it('findGameErrors() should return an array containing errorMessage.gameEmptyDescription if description is empty', () => {
        const spyValidString = jest.spyOn(service, 'isValidString').mockReturnValue(false);
        const foundErrors = service.findGameErrors(gameMocks.gameValidQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.gameEmptyDescription));
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.description);
    });

    it('findGameErrors() should return an array containing errorMessage.gameDuration if duration is invalid', () => {
        const spyRange = jest.spyOn(service, 'isValidRange').mockReturnValue(false);
        const foundErrors = service.findGameErrors(gameMocks.gameValidQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.gameDuration));
        expect(spyRange).toHaveBeenCalledWith(gameMocks.gameValidQuestion.duration, MIN_DURATION, MAX_DURATION);
    });

    it('findGameErrors() should return an array containing errorMessage.gameQuestionsNumber if it contains no question', () => {
        const testNoQuestionGame = gameMocks.gameValidQuestion;
        testNoQuestionGame.questions = [];
        const foundErrors = service.findGameErrors(gameMocks.gameValidQuestion);
        expect(foundErrors.find((message: string) => message === errorMessage.gameQuestionsNumber));
    });

    it('findGameErrors() should return an array containing all errors from invalid questions', () => {
        const spyValidateQuestion = jest.spyOn(service, 'findQuestionErrors').mockImplementation(() => [errorMessage.questionEmptyText]);

        const invalidQuestionsGame = gameMocks.gameValidQuestion;
        invalidQuestionsGame.questions = [];
        for (let i = 0; i < 2; i++) {
            invalidQuestionsGame.questions.push(questionMocks.validQuestion);
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
        expect(service.findGameErrors(gameMocks.gameValidQuestion)).toEqual([
            errorMessage.gameEmptyTitle,
            errorMessage.gameEmptyDescription,
            errorMessage.gameDuration,
        ]);
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.title);
        expect(spyValidString).toHaveBeenCalledWith(gameMocks.gameValidQuestion.description);
        expect(spyRange).toHaveBeenCalledWith(gameMocks.gameValidQuestion.duration, MIN_DURATION, MAX_DURATION);
        expect(spyValidateQuestion).toHaveBeenCalledTimes(gameMocks.gameValidQuestion.questions.length);
    });
});

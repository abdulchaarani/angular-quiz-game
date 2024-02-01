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

    // TODO: Maybe check if it's okay to assume minimum < maximum
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

    it('isValidChoicesRatio() should return true if there are at least 1 good and 1 wrong choices, else false', () => {
        // TODO
    });

    it('isValidQuestion() should check if the question has the right number of choices, points, and ratio.', () => {
        // TODO
    });

    it('isValidQuestionsList() should return true if all the questions are valid, else false', () => {
        // TODO
    });
    it('isValidGame() should return true if the duration, the title, the description, the number of questions and all questions are valid, else false', () => {
        // TODO
    });
});

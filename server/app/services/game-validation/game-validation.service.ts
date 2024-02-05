import { constants } from '@app/constants/game-validation-constants';
import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    isValidString(text: string): boolean {
        return text && text.trim() !== '';
    }

    isValidChoicesRatio(question: CreateQuestionDto): boolean {
        let isValidRightChoiceNumber = false;
        let isValidWrongChoiceNumber = false;
        question.choices.forEach((choice: Choice) => {
            if (choice.isCorrect && this.isValidString(choice.text)) {
                isValidRightChoiceNumber = true;
            } else if (!choice.isCorrect && this.isValidString(choice.text)) {
                isValidWrongChoiceNumber = true;
            }
        });
        return isValidRightChoiceNumber && isValidWrongChoiceNumber;
    }

    isValidRange(quantity: number, firstBound: number, secondBound: number, step?: number) {
        const min = Math.min(firstBound, secondBound);
        const max = Math.max(firstBound, secondBound);
        if (step) {
            return quantity >= min && quantity <= max && quantity % step === 0;
        } else {
            return quantity >= min && quantity <= max;
        }
    }

    findQuestionErrors(question: CreateQuestionDto): string[] {
        const errorMessages: string[] = [];

        const isValidChoicesNumber = this.isValidRange(question.choices.length, constants.MINIMUM_CHOICES_NUMBER, constants.MAXIMUM_CHOICES_NUMBER);
        const isValidPointsNumber = this.isValidRange(question.points, constants.MINIMUM_POINTS, constants.MAXIMUM_POINTS, constants.STEP_POINTS);
        const isValidQuestionName = this.isValidString(question.text);
        const isValidQuestionRatio = this.isValidChoicesRatio(question);
        if (!isValidChoicesNumber) {
            errorMessages.push(constants.CHOICES_NUMBER_ERROR_MESSAGE);
        }
        if (!isValidPointsNumber) {
            errorMessages.push(constants.POINTS_ERROR_MESSAGE);
        }
        if (!isValidQuestionName) {
            errorMessages.push(constants.QUESTION_EMPTY_TEXT_ERROR_MESSAGE);
        }
        if (!isValidQuestionRatio) {
            errorMessages.push(constants.CHOICES_RATIO_ERROR_MESSAGE);
        }
        return errorMessages;
    }

    findGameErrors(game: Game): string[] {
        const errorMessages: string[] = [];
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, constants.MINIMUM_DURATION, constants.MAXIMUM_DURATION);
        const isValidQuestionsNumber = game.questions.length >= constants.MINIMUM_QUESTIONS_NUMBER;

        if (!isValidTitle) {
            errorMessages.push(constants.GAME_EMPTY_TITLE_ERROR_MESSAGE);
        }
        if (!isValidDescription) {
            errorMessages.push(constants.GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE);
        }
        if (!isValidDuration) {
            errorMessages.push(constants.GAME_DURATION_ERROR_MESSAGE);
        }
        if (!isValidQuestionsNumber) {
            errorMessages.push(constants.GAME_QUESTIONS_NUMBER_ERROR_MESSAGE);
        }
        game.questions.forEach((question: CreateQuestionDto, index: number) => {
            const questionErrorMessages = this.findQuestionErrors(question);
            if (questionErrorMessages.length !== 0) {
                errorMessages.push(`La question ${index + 1} est invalide:`);
                questionErrorMessages.forEach((message) => errorMessages.push(message));
            }
        });
        return errorMessages;
    }
}

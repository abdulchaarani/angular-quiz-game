import {
    CHOICES_NUMBER_ERROR_MESSAGE,
    CHOICES_RATIO_ERROR_MESSAGE,
    GAME_DURATION_ERROR_MESSAGE,
    GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE,
    GAME_EMPTY_TITLE_ERROR_MESSAGE,
    GAME_QUESTIONS_NUMBER_ERROR_MESSAGE,
    MAXIMUM_CHOICES_NUMBER,
    MAXIMUM_DURATION,
    MAXIMUM_POINTS,
    MINIMUM_CHOICES_NUMBER,
    MINIMUM_DURATION,
    MINIMUM_POINTS,
    MINIMUM_QUESTIONS_NUMBER,
    POINTS_ERROR_MESSAGE,
    QUESTION_EMPTY_TEXT_ERROR_MESSAGE,
    STEP_POINTS,
} from '@app/constants/game-validation-constants';
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
        question.choices.forEach((choice) => {
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

        const isValidChoicesNumber = this.isValidRange(question.choices.length, MINIMUM_CHOICES_NUMBER, MAXIMUM_CHOICES_NUMBER);
        const isValidPointsNumber = this.isValidRange(question.points, MINIMUM_POINTS, MAXIMUM_POINTS, STEP_POINTS);
        const isValidQuestionName = this.isValidString(question.text);
        const isValidQuestionRatio = this.isValidChoicesRatio(question);
        if (!isValidChoicesNumber) {
            errorMessages.push(CHOICES_NUMBER_ERROR_MESSAGE);
        }
        if (!isValidPointsNumber) {
            errorMessages.push(POINTS_ERROR_MESSAGE);
        }
        if (!isValidQuestionName) {
            errorMessages.push(QUESTION_EMPTY_TEXT_ERROR_MESSAGE);
        }
        if (!isValidQuestionRatio) {
            errorMessages.push(CHOICES_RATIO_ERROR_MESSAGE);
        }
        return errorMessages;
    }

    findGameErrors(game: Game): string[] {
        const errorMessages: string[] = [];
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, MINIMUM_DURATION, MAXIMUM_DURATION);
        const isValidQuestionsNumber = game.questions.length >= MINIMUM_QUESTIONS_NUMBER;

        if (!isValidTitle) {
            errorMessages.push(GAME_EMPTY_TITLE_ERROR_MESSAGE);
        }
        if (!isValidDescription) {
            errorMessages.push(GAME_EMPTY_DESCRIPTION_ERROR_MESSAGE);
        }
        if (!isValidDuration) {
            errorMessages.push(GAME_DURATION_ERROR_MESSAGE);
        }
        if (!isValidQuestionsNumber) {
            errorMessages.push(GAME_QUESTIONS_NUMBER_ERROR_MESSAGE);
        }
        game.questions.forEach((question, index) => {
            const questionErrorMessages = this.findQuestionErrors(question);
            if (questionErrorMessages.length !== 0) {
                errorMessages.push(`La question ${index} est invalide.`);
                questionErrorMessages.forEach((message) => errorMessages.push(message));
            }
        });
        return errorMessages;
    }
}

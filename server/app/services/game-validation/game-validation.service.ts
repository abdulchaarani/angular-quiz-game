import { errorMessage } from '@app/constants/game-error-messages';
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

    isValidRange(quantity: number, firstBound: number, secondBound: number) {
        const min = Math.min(firstBound, secondBound);
        const max = Math.max(firstBound, secondBound);
        return quantity >= min && quantity <= max;
    }

    findQuestionErrors(question: CreateQuestionDto): string[] {
        const errorMessages: string[] = [];

        const isValidChoicesNumber = this.isValidRange(question.choices.length, constants.minimumChoicesNumber, constants.maximumChoicesNumber);
        const isValidPointsRange = this.isValidRange(question.points, constants.minimumPoints, constants.maximumPoints);
        const isValidPointsMultiple = question.points % constants.stepPoints === 0;
        const isValidQuestionName = this.isValidString(question.text);
        const isValidQuestionRatio = this.isValidChoicesRatio(question);
        if (!isValidChoicesNumber) {
            errorMessages.push(errorMessage.choicesNumber);
        }
        if (!isValidPointsRange || !isValidPointsMultiple) {
            errorMessages.push(errorMessage.points);
        }
        if (!isValidQuestionName) {
            errorMessages.push(errorMessage.questionEmptyText);
        }
        if (!isValidQuestionRatio) {
            errorMessages.push(errorMessage.choicesRatio);
        }
        return errorMessages;
    }

    findGameErrors(game: Game): string[] {
        const errorMessages: string[] = [];
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, constants.minimumDuration, constants.maximumDuration);
        const isValidQuestionsNumber = game.questions.length >= constants.minimumQuestionsNumber;

        if (!isValidTitle) {
            errorMessages.push(errorMessage.gameEmptyTitle);
        }
        if (!isValidDescription) {
            errorMessages.push(errorMessage.gameEmptyDescription);
        }
        if (!isValidDuration) {
            errorMessages.push(errorMessage.gameDuration);
        }
        if (!isValidQuestionsNumber) {
            errorMessages.push(errorMessage.gameQuestionsNumber);
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

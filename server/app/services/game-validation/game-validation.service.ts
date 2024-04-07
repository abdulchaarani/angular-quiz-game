import {
    MAX_CHOICES_NUMBER,
    MAX_DURATION,
    MAX_POINTS,
    MIN_CHOICES_NUMBER,
    MIN_DURATION,
    MIN_POINTS,
    MIN_QUESTIONS_NUMBER,
    STEP_POINTS,
} from '@app/constants/game-validation-constraints';
import {
    ERROR_CHOICES_NUMBER,
    ERROR_CHOICES_RATIO,
    ERROR_DURATION,
    ERROR_EMPTY_DESCRIPTION,
    ERROR_EMPTY_QUESTION,
    ERROR_EMPTY_TITLE,
    ERROR_POINTS,
    ERROR_QUESTIONS_NUMBER,
    ERROR_QUESTION_TYPE,
    ERROR_REPEAT_CHOICES,
} from '@app/constants/game-validation-errors';
import { QuestionType } from '@app/constants/question-types';
import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
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

    isUniqueChoices(choices: Choice[]): boolean {
        const choicesTexts = [];
        choices.forEach((choice) => {
            choicesTexts.push(choice.text);
        });
        return new Set(choicesTexts).size === choicesTexts.length;
    }

    findGeneralQuestionErrors(question: CreateQuestionDto): string[] {
        const errorMessages: string[] = [];
        const isValidPointsRange = this.isValidRange(question.points, MIN_POINTS, MAX_POINTS);
        const isValidPointsMultiple = question.points % STEP_POINTS === 0;
        const isValidQuestionName = this.isValidString(question.text);
        const isCorrectType = question.type === QuestionType.CHOICE || question.type === QuestionType.LONG;
        if (!isValidPointsRange || !isValidPointsMultiple) {
            errorMessages.push(ERROR_POINTS);
        }
        if (!isValidQuestionName) {
            errorMessages.push(ERROR_EMPTY_QUESTION);
        }
        if (!isCorrectType) {
            errorMessages.push(ERROR_QUESTION_TYPE);
        }
        return errorMessages;
    }

    findChoicesQuestionErrors(question: CreateQuestionDto): string[] {
        const errorMessages: string[] = this.findGeneralQuestionErrors(question);
        const isUniqueChoices = this.isUniqueChoices(question.choices);
        const isValidChoicesNumber = this.isValidRange(question.choices.length, MIN_CHOICES_NUMBER, MAX_CHOICES_NUMBER);
        const isValidChoicesRatio = this.isValidChoicesRatio(question);
        if (!isValidChoicesNumber) {
            errorMessages.push(ERROR_CHOICES_NUMBER);
        }
        if (!isUniqueChoices) {
            errorMessages.push(ERROR_REPEAT_CHOICES);
        }
        if (!isValidChoicesRatio) {
            errorMessages.push(ERROR_CHOICES_RATIO);
        }
        return errorMessages;
    }

    findGameErrors(game: Game): string[] {
        const errorMessages: string[] = [];
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, MIN_DURATION, MAX_DURATION);
        const isValidQuestionsNumber = game.questions.length >= MIN_QUESTIONS_NUMBER;

        if (!isValidTitle) {
            errorMessages.push(ERROR_EMPTY_TITLE);
        }
        if (!isValidDescription) {
            errorMessages.push(ERROR_EMPTY_DESCRIPTION);
        }
        if (!isValidDuration) {
            errorMessages.push(ERROR_DURATION);
        }
        if (!isValidQuestionsNumber) {
            errorMessages.push(ERROR_QUESTIONS_NUMBER);
        }
        game.questions.forEach((question: CreateQuestionDto, index: number) => {
            const questionErrorMessages = this.findQuestionErrors(question);
            if (questionErrorMessages.length !== 0) {
                errorMessages.push(`La question ${index + 1} est invalide:`);
                questionErrorMessages.forEach((message: string) => errorMessages.push(message));
            }
        });
        return errorMessages;
    }

    findQuestionErrors(question: Question): string[] {
        return question.type === QuestionType.CHOICE ? this.findChoicesQuestionErrors(question) : this.findGeneralQuestionErrors(question);
    }
}

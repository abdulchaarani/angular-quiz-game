import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    isValidString(text: string): boolean {
        return text && text.trim() !== '';
    }

    isValidChoicesRatio(question: Question): boolean {
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

    // TODO: Case if someone mistakes min > max (??)
    isValidRange(quantity: number, min: number, max: number, step?: number) {
        if (step) {
            return quantity >= min && quantity <= max && quantity % step === 0;
        } else {
            return quantity >= min && quantity <= max;
        }
    }

    // TODO: Remove
    isValidQuestion(question: Question): boolean {
        const MINIMUM_CHOICES_NUMBER = 2;
        const MAXIMUM_CHOICES_NUMBER = 4;
        const MINIMUM_POINTS = 10;
        const MAXIMUM_POINTS = 100;
        const STEP_POINTS = 10;
        const isValidChoicesNumber = this.isValidRange(question.choices.length, MINIMUM_CHOICES_NUMBER, MAXIMUM_CHOICES_NUMBER);
        const isValidPointsNumber = this.isValidRange(question.points, MINIMUM_POINTS, MAXIMUM_POINTS, STEP_POINTS);
        const isValidQuestionName = this.isValidString(question.text);
        return isValidQuestionName && isValidChoicesNumber && isValidPointsNumber && this.isValidChoicesRatio(question);
    }

    // TODO: Remove
    isValidQuestionsList(questions: Question[]) {
        for (let i = 0; i < questions.length; i++) {
            if (!this.isValidQuestion(questions[i])) {
                return false;
            }
        }
        return true;
    }

    // TODO: Remove
    isValidGame(game: Game): boolean {
        const MINIMUM_DURATION = 10;
        const MAXIMUM_DURATION = 60;
        const MINIMUM_QUESTIONS_NUMBER = 1;
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, MINIMUM_DURATION, MAXIMUM_DURATION);
        const isValidQuestionsNumber = game.questions.length >= MINIMUM_QUESTIONS_NUMBER;
        const isValidQuestionsList = this.isValidQuestionsList(game.questions);

        return isValidTitle && isValidDescription && isValidDuration && isValidQuestionsNumber && isValidQuestionsList;
    }

    // REFACTORISATION

    findQuestionErrors(question: Question): string[] {
        const errorMessages: string[] = [];
        const MINIMUM_CHOICES_NUMBER = 2;
        const MAXIMUM_CHOICES_NUMBER = 4;
        const MINIMUM_POINTS = 10;
        const MAXIMUM_POINTS = 100;
        const STEP_POINTS = 10;
        const isValidChoicesNumber = this.isValidRange(question.choices.length, MINIMUM_CHOICES_NUMBER, MAXIMUM_CHOICES_NUMBER);
        const isValidPointsNumber = this.isValidRange(question.points, MINIMUM_POINTS, MAXIMUM_POINTS, STEP_POINTS);
        const isValidQuestionName = this.isValidString(question.text);
        const isValidQuestionRatio = this.isValidChoicesRatio(question);
        if (!isValidChoicesNumber) {
            errorMessages.push(`Il doit y avoir entre ${MINIMUM_CHOICES_NUMBER} et ${MAXIMUM_CHOICES_NUMBER} choix dans la question.`);
        }
        if (!isValidPointsNumber) {
            errorMessages.push(
                `Le nombre de points doit être entre ${MINIMUM_POINTS} et ${MAXIMUM_POINTS} tout en étant divisible par ${STEP_POINTS}`,
            );
        }
        if (!isValidQuestionName) {
            errorMessages.push('Le texte de la question ne doit pas être vide.');
        }
        if (!isValidQuestionRatio) {
            errorMessages.push('Il doit y avoir au moins un choix valide et un choix invalide.');
        }
        return errorMessages;
    }

    findGameErrors(game: Game): string[] {
        const errorMessages: string[] = [];
        const MINIMUM_DURATION = 10;
        const MAXIMUM_DURATION = 60;
        const MINIMUM_QUESTIONS_NUMBER = 1;
        const isValidTitle = this.isValidString(game.title);
        const isValidDescription = this.isValidString(game.description);
        const isValidDuration = this.isValidRange(game.duration, MINIMUM_DURATION, MAXIMUM_DURATION);
        const isValidQuestionsNumber = game.questions.length >= MINIMUM_QUESTIONS_NUMBER;

        if (!isValidTitle) {
            errorMessages.push('Le titre du jeu est vide.');
        }
        if (!isValidDescription) {
            errorMessages.push('La description du jeu est vide.');
        }
        if (!isValidDuration) {
            errorMessages.push('La durée doit être entre 10 et 60 secondes.');
        }
        if (!isValidQuestionsNumber) {
            errorMessages.push('Le jeu doit avoir au moins une question.');
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

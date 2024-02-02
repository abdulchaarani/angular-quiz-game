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
        // TODO: Improve "algorithm" efficiency and whitespace detection
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

    isValidQuestion(question: Question): boolean {
        const MINIMUM_CHOICES_NUMBER = 2;
        const MAXIMUM_CHOICES_NUMBER = 4;
        const MINIMUM_POINTS = 10;
        const MAXIMUM_POINTS = 100;
        const STEP_POINTS = 10;
        const isValidChoicesNumber = this.isValidRange(question.choices.length, MINIMUM_CHOICES_NUMBER, MAXIMUM_CHOICES_NUMBER);
        const isValidPointsNumber = this.isValidRange(question.points, MINIMUM_POINTS, MAXIMUM_POINTS, STEP_POINTS);
        const isValidQuestionName = this.isValidString(question.question);
        return isValidQuestionName && isValidChoicesNumber && isValidPointsNumber && this.isValidChoicesRatio(question);
    }

    isValidQuestionsList(questions: Question[]) {
        for (let i = 0; i < questions.length; i++) {
            if (!this.isValidQuestion(questions[i])) {
                return false;
            }
        }
        return true;
    }

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
}

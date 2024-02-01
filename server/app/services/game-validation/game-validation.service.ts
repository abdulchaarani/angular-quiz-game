import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameValidationService {
    // Move to QuestionService
    isValidQuestion(question: Question): boolean {
        // TODO: Detect if "similar" question exists (especially for questionbank)
        const isValidChoicesNumber = question.choices.length >= 2 && question.choices.length <= 4;
        const isValidPointsNumber = question.points >= 10 && question.points <= 100 && question.points % 10 === 0;
        let isValidRightChoiceNumber = false;
        let isValidWrongChoiceNumber = false;
        // TODO: Improve "algorithm" efficiency and whitespace detection
        question.choices.forEach((choice) => {
            if (choice.isCorrect && choice.text !== '') {
                isValidRightChoiceNumber = true;
            } else if (!choice.isCorrect && choice.text !== ' ') {
                isValidWrongChoiceNumber = true;
            }
        });
        return isValidChoicesNumber && isValidPointsNumber && isValidRightChoiceNumber && isValidWrongChoiceNumber;
    }

    isValidGame(game: Game): boolean {
        // TODO: Improve whitespace detection + Detect if "similar" game exists
        const isValidTitle = game.title !== '';
        const isValidDescription = game.description !== '';
        const isValidDuration = game.duration >= 10 && game.duration <= 60;
        const isValidQuestionsNumber = game.questions.length >= 1;
        let areValidQuestions = true;
        // TODO: Improve "algorithm" efficiency
        game.questions.forEach((question) => {
            if (!this.isValidQuestion(question)) {
                areValidQuestions = false;
            }
        });
        return isValidTitle && isValidDescription && isValidDuration && isValidQuestionsNumber && areValidQuestions;
    }
}

import { Game } from '@app/model/database/game';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameCreationService {
    updateDateAndVisibility(game: Game): Game {
        const currentDate = new Date();
        game.isVisible = false;
        game.lastModification = currentDate;
        game.questions.forEach((question) => (question.lastModification = currentDate));
        return game;
    }

    generateId(game: Game): Game {
        game.id = uuidv4();
        game.questions.forEach((question) => (question.id = uuidv4()));
        return game;
    }

    completeIsCorrectField(game: Game): Game {
        game.questions.forEach((question) => {
            question.choices.forEach((choice) => {
                if (choice.isCorrect === null || choice.isCorrect === undefined) {
                    choice.isCorrect = false;
                }
            });
        });
        return game;
    }
}

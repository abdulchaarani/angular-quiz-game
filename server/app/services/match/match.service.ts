import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MatchService {
    // TODO: Tests
    backupGames: Game[];
    constructor(private readonly gameService: GameService) {
        this.backupGames = [];
    }

    async getAllVisibleGames(): Promise<Game[]> {
        const visibleGames = await this.gameService.getAllVisibleGames();
        const gamesWithoutIsCorrectField: Game[] = [];
        visibleGames.forEach((game) => {
            gamesWithoutIsCorrectField.push(this.removeIsCorrectField(game));
        });
        return gamesWithoutIsCorrectField;
    }

    async getGameByIdWithoutIsCorrect(gameId: string): Promise<Game> {
        let game = await this.gameService.getGameById(gameId);
        game = this.removeIsCorrectField(game);
        return game;
    }

    // TODO: Check if it's okay to not put async here (since there is no communication with DB)
    getBackupGame(gameId: string): Game {
        return this.backupGames.find((currentGame) => {
            return currentGame.id === gameId;
        });
    }

    getBackupQuestion(gameId: string, questionId: string): Question {
        const game = this.getBackupGame(gameId);
        return game.questions.find((currentQuestion) => {
            return currentQuestion.id === questionId;
        });
    }

    getChoices(gameId: string, questionId: string): Choice[] {
        return this.getBackupQuestion(gameId, questionId).choices;
    }

    validatePlayerChoice(gameId: string, questionId: string, selectedChoices: string[]): boolean {
        const question = this.getBackupQuestion(gameId, questionId);
        const expectedChoices: string[] = [];
        question.choices.forEach((choice) => {
            if (choice.isCorrect) {
                expectedChoices.push(choice.text);
            }
        });
        return expectedChoices.sort().toString() === selectedChoices.sort().toString();
    }

    async saveBackupGame(gameId: string): Promise<Game> {
        try {
            let backupGame = await this.gameService.getGameById(gameId);
            this.backupGames.push(backupGame);
            backupGame = this.removeIsCorrectField(backupGame);
            return backupGame;
        } catch (error) {
            return Promise.reject('Le jeu est introuvable.');
        }
    }

    async deleteBackupGame(gameToDeleteId: string): Promise<void> {
        const deleteIndex = this.backupGames.findIndex((game: Game) => game.id === gameToDeleteId);
        const notFoundIndex = -1;
        if (deleteIndex !== notFoundIndex) {
            this.backupGames.splice(deleteIndex, 1);
        } else {
            return Promise.reject("La copie du jeu n'a pas pu être supprimée.");
        }
    }

    removeIsCorrectField(game: Game): Game {
        const stringifiedGame = JSON.stringify(game, (key, value) => {
            if (key !== 'isCorrect' && key !== '_id' && key !== '__v') {
                return value;
            }
        });
        return JSON.parse(stringifiedGame);
    }
}

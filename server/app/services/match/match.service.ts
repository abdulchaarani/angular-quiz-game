import { Choice } from '@app/model/database/choice';
import { Game } from '@app/model/database/game';
import { Injectable } from '@nestjs/common';
import { GameService } from '../game/game.service';

@Injectable()
export class MatchService {
    // TODO: Tests
    public temporaryGames: Game[];
    constructor(private readonly gameService: GameService) {
        this.temporaryGames = [];
    }

    async getAllVisibleGames(): Promise<Game[]> {
        const visibleGames = await this.gameService.getAllVisibleGames();
        const gamesWithoutIsCorrectField: Game[] = [];
        visibleGames.forEach((game) => {
            gamesWithoutIsCorrectField.push(this.removeIsCorrectField(game));
        });
        return gamesWithoutIsCorrectField;
    }

    async getGameById(gameId: string): Promise<Game> {
        let game = await this.gameService.getGameById(gameId);
        game = this.removeIsCorrectField(game);
        return game;
    }

    async getTemporaryGame(gameId: string): Promise<Game> {
        return this.temporaryGames.find((currentGame) => {
            return currentGame.id === gameId;
        });
    }

    async getTemporaryQuestion(gameId: string, questionId: string) {
        const game = await this.getTemporaryGame(gameId);
        return game.questions.find((currentQuestion) => {
            return currentQuestion.id === questionId;
        });
    }

    async getChoices(gameId: string, questionId: string): Promise<Choice[]> {
        return (await this.getTemporaryQuestion(gameId, questionId)).choices;
    }

    // TODO: Tests
    async validatePlayerChoice(gameId: string, questionId: string, selectedChoices: string[]): Promise<boolean> {
        const question = await this.getTemporaryQuestion(gameId, questionId);
        const expectedChoices: string[] = [];
        question.choices.forEach((choice) => {
            if (choice.isCorrect) {
                expectedChoices.push(choice.text);
            }
        });
        return expectedChoices.sort().toString() === selectedChoices.sort().toString();
    }

    // Method to allow players to play a game that becomes deleted during the match.
    async saveGameBackup(gameId: string): Promise<void> {
        try {
            let backupGame = await this.gameService.getGameById(gameId);
            backupGame = this.removeIsCorrectField(backupGame);
            this.temporaryGames.push(backupGame);
        } catch (error) {
            return Promise.reject('Le jeu ne peut pas être accédé.');
        }
    }

    async deleteGameBackup(gameToDeleteId: string): Promise<void> {
        this.temporaryGames = this.temporaryGames.filter((game: Game) => {
            return game.id !== gameToDeleteId;
        });
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

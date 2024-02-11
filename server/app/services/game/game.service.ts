import { GAMES_TO_POPULATE } from '@app/constants/populate-constants';
import { Choice } from '@app/model/database/choice';
import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { CreateQuestionDto } from '@app/model/dto/question/create-question-dto';
import { GameValidationService } from '@app/services/game-validation/game-validation.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        private validation: GameValidationService,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.gameModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.gameModel.insertMany(GAMES_TO_POPULATE);
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getAllVisibleGames(): Promise<Game[]> {
        return await this.gameModel.find({ isVisible: true });
    }

    async getGameById(gameId: string): Promise<Game> {
        const game = await this.gameModel.findOne({ id: gameId });
        if (!game) {
            return Promise.reject('Le jeu est introuvable.');
        } else {
            return game;
        }
    }

    async getGameByTitle(gameTitle: string): Promise<Game> {
        return await this.gameModel.findOne({ title: gameTitle });
    }

    async getChoices(gameId: string, questionId: string): Promise<Choice[]> {
        const game = await this.getGameById(gameId);
        const question = game.questions.find((currentQuestion) => {
            return currentQuestion.id === questionId;
        });
        return question ? question.choices : Promise.reject('La question est introuvable.');
    }

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

    async addGame(newGame: CreateGameDto): Promise<Game> {
        if (await this.getGameByTitle(newGame.title)) {
            return Promise.reject('Un jeu du même titre existe déjà.');
        }
        newGame = this.updateDateAndVisibility(this.generateId(newGame));

        try {
            const errorMessages = this.validation.findGameErrors(newGame);
            if (errorMessages.length === 0) {
                await this.gameModel.create(newGame);
                return newGame;
            } else {
                return Promise.reject(`Le jeu est invalide:\n${errorMessages.join('\n')}`);
            }
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être ajouté: ${error}`);
        }
    }

    async toggleGameVisibility(gameId: string): Promise<Game> {
        const filterQuery = { id: gameId };
        try {
            const gameToToggleVisibility = await this.getGameById(gameId);
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
            await this.gameModel.updateOne(filterQuery, gameToToggleVisibility);
            return gameToToggleVisibility;
        } catch (error) {
            return Promise.reject(`Erreur: ${error}`);
        }
    }

    async upsertGame(game: UpdateGameDto): Promise<Game> {
        const filterQuery = { id: game.id };
        try {
            const errorMessages = this.validation.findGameErrors(game);
            if (errorMessages.length !== 0) {
                return Promise.reject(`Le jeu est invalide:\n${errorMessages.join('\n')}`);
            }
            game = this.updateDateAndVisibility(game);

            await this.gameModel.findOneAndUpdate(filterQuery, game, {
                new: true,
                upsert: true,
            });
            return game;
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être modifié: ${error}`);
        }
    }

    async deleteGame(gameId: string): Promise<void> {
        try {
            await this.getGameById(gameId);
        } catch (error) {
            return Promise.reject(`Erreur: ${error}`);
        }
        try {
            await this.gameModel.deleteOne({ id: gameId });
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être supprimé: ${error}`);
        }
    }

    async validateQuestion(question: CreateQuestionDto): Promise<boolean> {
        const errorMessages = this.validation.findQuestionErrors(question);
        if (errorMessages.length !== 0) {
            return Promise.reject(`La question est invalide:\n${errorMessages.join('\n')}`);
        }
        return true;
    }
}

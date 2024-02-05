import { GAMES_TO_POPULATE } from '@app/constants/populate-constants';
import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
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

    async getGameById(gameId: string): Promise<Game> {
        const game = await this.gameModel.findOne({ id: gameId });
        if (!game) {
            return Promise.reject(`Le jeu avec le id: ${gameId} n'a pas été trouvé.`);
        } else {
            return game;
        }
    }

    async getGameByTitle(gameTitle: string): Promise<Game> {
        return await this.gameModel.findOne({ title: gameTitle });
    }

    // TODO: Test
    updateDateAndVisibility(game: Game): Game {
        const currentDate = new Date();
        game.isVisible = false;
        game.lastModification = currentDate;
        game.questions.forEach((question) => (question.lastModification = currentDate));
        return game;
    }

    // TODO: Test
    generateId(game: Game): Game {
        game.id = uuidv4();
        game.questions.forEach((question) => (question.id = uuidv4()));
        return game;
    }

    async addGame(newGame: CreateGameDto): Promise<Game> {
        // TODO: Add unit test for when a game already exists.
        if (await this.getGameByTitle(newGame.title)) {
            return Promise.reject('Un jeu du même titre existe déjà.');
        }
        newGame = this.updateDateAndVisibility(this.generateId(newGame));

        try {
            const gameErrorMessages = this.validation.findGameErrors(newGame);
            if (gameErrorMessages.length === 0) {
                await this.gameModel.create(newGame);
                return newGame;
            } else {
                const messagesToDisplay = gameErrorMessages.join('\n');
                return Promise.reject(`Le jeu est invalide:\n${messagesToDisplay}`);
            }
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être ajouté: ${error}`);
        }
    }

    async toggleGameVisibility(gameId: string): Promise<void> {
        const filterQuery = { id: gameId };
        let gameToToggleVisibility = await this.getGameById(gameId);
        gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
        const res = await this.gameModel.updateOne(filterQuery, gameToToggleVisibility);
        if (res.matchedCount === 0) {
            return Promise.reject('Le jeu est introuvable.');
        }
    }

    async upsertGame(game: UpdateGameDto): Promise<void> {
        const filterQuery = { id: game.id };
        try {
            const errorMessages = this.validation.findGameErrors(game);
            if (errorMessages.length !== 0) {
                return Promise.reject(`Le jeu est invalide:\n${errorMessages}`);
            }
            game = this.updateDateAndVisibility(game);

            const res = await this.gameModel.findOneAndUpdate(filterQuery, game, {
                new: true,
                upsert: true,
            });
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être modifié: ${error}`);
        }
    }

    async deleteGame(gameId: string): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                id: gameId,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Le jeu est introuvable');
            }
        } catch (error) {
            return Promise.reject(`Le jeu n'a pas pu être supprimé: ${error}`);
        }
    }

    // TODO: Match Method -- Add Body which would contain list of choices + Tests
    async validatePlayerChoice(gameId: string, questionId: string): Promise<boolean> {
        try {
            const game = await this.getGameById(gameId);
            const question = game.questions.find((question) => question.id === questionId);
            for (let i = 0; i < question.choices.length; i++) {
                // TODO: If question.choices[i] !== listChoices, pouet pouet
                continue;
            }
            return true;
        } catch (error) {
            return Promise.reject('Le jeu est introuvable.');
        }
    }
}

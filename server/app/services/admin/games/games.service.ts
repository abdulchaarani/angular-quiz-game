import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GamesService {
    constructor(
        @InjectModel(Game.name) public gameModel: Model<GameDocument>,
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
        // TODO: Add Questions
        const GAMES: CreateGameDto[] = [
            {
                id: 0,
                title: 'Hoot Hoot',
                description: 'HOOT HOOT',
                duration: 60,
                isVisible: true,
                lastModification: new Date(2024, 1, 10),
            },
            {
                id: 1,
                title: 'Lune quantique',
                description: 'OOOOOH',
                duration: 60,
                isVisible: true,
                lastModification: new Date(2024, 10, 1),
            },
            {
                id: 2,
                title: 'Pokemon Quiz',
                description: 'WHO IS THAT POKEMON',
                duration: 30,
                isVisible: false,
                lastModification: new Date(2023, 2, 24),
            },
        ];
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.gameModel.insertMany(GAMES);
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGameById(gameId: number): Promise<Game> {
        return await this.gameModel.findOne({ id: gameId });
    }

    async addGame(newGame: CreateGameDto): Promise<void> {
        // TODO: Add verifications in another function
        try {
            await this.gameModel.create(newGame);
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async addGameFromJson(newGame: CreateGameDto): Promise<Game> {
        // const newGame = JSON.parse(newGameStringified);
        newGame.isVisible = true;
        await this.addGame(newGame);
        return newGame;
    }

    async modifyCourse(game: UpdateGameDto): Promise<void> {
        const filterQuery = { id: game.id };
        // Can also use replaceOne if we want to replace the entire object
        try {
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to update document: ${error}`);
        }
    }

    async toggleGameVisibility(gameId: number): Promise<void> {
        const gameToToggleVisibility = await this.getGameById(gameId);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
            await this.modifyCourse(gameToToggleVisibility);
        }
    }

    async deleteGame(gameId: number): Promise<void> {
        try {
            const res = await this.gameModel.deleteOne({
                id: gameId,
            });
            if (res.deletedCount === 0) {
                return Promise.reject('Could not find game');
            }
        } catch (error) {
            return Promise.reject(`Failed to delete game: ${error}`);
        }
    }
}

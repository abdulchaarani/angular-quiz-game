import { Game, GameDocument } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { GameValidationService } from '../game-validation/game-validation.service';

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
        const GAMES: CreateGameDto[] = [
            {
                id: '0',
                title: 'Hoot Hoot',
                description: 'HOOT HOOT',
                duration: 60,
                isVisible: true,
                lastModification: new Date(2024, 1, 2),
                questions: [
                    {
                        id: '2',
                        type: 'QCM',
                        description: 'Inspiration Leblanc',
                        question: "Savez-vous de quel auteur Leblanc s'est inspiré ?",
                        points: 60,
                        choices: [
                            {
                                text: 'Gaston Leroux',
                                isCorrect: false,
                            },
                            {
                                text: 'Arthur Conan Doyle',
                                isCorrect: true,
                            },
                            {
                                text: 'Edgar Wallace',
                                isCorrect: false,
                            },
                            {
                                text: 'Agatha Christie',
                                isCorrect: false,
                            },
                        ],
                        lastModification: new Date(2024, 1, 2),
                    },
                ],
            },
            {
                id: '1',
                title: 'Lune quantique',
                description: 'OOOOOH',
                duration: 60,
                isVisible: true,
                lastModification: new Date(2024, 2, 1),
                questions: [
                    {
                        id: '1',
                        type: 'QCM',
                        description: 'Outer Wilds',
                        question: 'Parmi les choix suivants, lesquels sont des noms de planètes dans Outer Wilds ?',
                        points: 20,
                        choices: [
                            {
                                text: 'Sombronces',
                                isCorrect: true,
                            },
                            {
                                text: 'Léviathe',
                                isCorrect: true,
                            },
                            {
                                text: 'Cravité',
                                isCorrect: true,
                            },
                            {
                                text: 'La Lanterne',
                                isCorrect: false,
                            },
                        ],
                        lastModification: new Date(2024, 1, 1),
                    },
                ],
            },
            {
                id: '2',
                title: 'Pokemon Quiz',
                description: 'WHO IS THAT POKEMON',
                duration: 30,
                isVisible: false,
                lastModification: new Date(2023, 2, 2),
                questions: [
                    {
                        id: '123',
                        type: 'QCM',
                        description: 'Psykokwak',
                        question: 'Quelles sont les principales caractéristiques de Psykokwak ?',
                        points: 50,
                        choices: [
                            {
                                text: 'Il dit "coin coin"',
                                isCorrect: false,
                            },
                            {
                                text: 'Il est le Pokémon préféré de Junichi Masuda, directeur et compositeur des jeux Pokémon.',
                                isCorrect: true,
                            },
                            {
                                text: 'Il est jaune.',
                                isCorrect: false,
                            },
                            {
                                text: 'Il a toujours mal à la tête.',
                                isCorrect: true,
                            },
                        ],
                        lastModification: new Date(2023, 2, 3),
                    },
                ],
            },
        ];
        this.logger.log('THIS ADDS DATA TO THE DATABASE, DO NOT USE OTHERWISE');
        await this.gameModel.insertMany(GAMES);
    }

    async getAllGames(): Promise<Game[]> {
        return await this.gameModel.find({});
    }

    async getGameById(gameId: string): Promise<Game> {
        return await this.gameModel.findOne({ id: gameId });
    }

    async getGameByTitle(gameTitle: string): Promise<Game> {
        return await this.gameModel.findOne({ title: gameTitle });
    }

    async addGame(newGame: CreateGameDto): Promise<void> {
        // TODO: Add unit test for when a game already exists.
        if (await this.getGameByTitle(newGame.title)) {
            return Promise.reject('Game with the same title already exists.');
        }
        newGame.id = uuidv4();
        newGame.isVisible = false;
        newGame.lastModification = new Date();
        try {
            if (this.validation.isValidGame(newGame)) {
                await this.gameModel.create(newGame);
            } else {
                return Promise.reject('Invalid game');
            }
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async updateGame(game: UpdateGameDto, upsert: boolean): Promise<void> {
        // TODO: Update LastModification if not ToggleVisibility
        const filterQuery = { id: game.id };
        try {
            if (!this.validation.isValidGame(game)) {
                return Promise.reject('Invalid game');
            }
            if (upsert) {
                // PUT
                game.isVisible = false;
                game.lastModification = new Date();
                const res = await this.gameModel.findOneAndUpdate(filterQuery, game, {
                    new: true,
                    upsert: true,
                });
            } else {
                // PATCH
                const res = await this.gameModel.updateOne(filterQuery, game);
                if (res.matchedCount === 0) {
                    return Promise.reject('Game not found');
                }
            }
        } catch (error) {
            return Promise.reject(`Failed to modify game: ${error}`);
        }
    }

    async deleteGame(gameId: string): Promise<void> {
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

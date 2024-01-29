import { Game, GameDocument } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { UpdateGameDto } from '@app/model/dto/game/update-game.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class GameService {
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
                id: 1,
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
                id: 2,
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

    async getGameById(gameId: number): Promise<Game> {
        return await this.gameModel.findOne({ id: gameId });
    }

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

    // TODO: Update Date property function

    async addGame(newGame: CreateGameDto): Promise<void> {
        newGame.isVisible = true;
        try {
            if (this.isValidGame(newGame)) {
                await this.gameModel.create(newGame);
            } else {
                return Promise.reject(`Invalid game`);
            }
        } catch (error) {
            return Promise.reject(`Failed to insert game: ${error}`);
        }
    }

    async updateGame(game: UpdateGameDto): Promise<void> {
        const filterQuery = { id: game.id };
        // Can also use replaceOne if we want to replace the entire object
        // TODO: Case when someone edited a deleted game; we need to create a new game.
        try {
            if (!this.isValidGame(game)) {
                return Promise.reject('Invalid game');
            }
            const res = await this.gameModel.updateOne(filterQuery, game);
            if (res.matchedCount === 0) {
                try {
                    this.addGame(game);
                } catch (error) {
                    return Promise.reject('Could not find game');
                }
            }
        } catch (error) {
            return Promise.reject(`Failed to modify game: ${error}`);
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

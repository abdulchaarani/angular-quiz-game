import { Game } from '@app/model/database/game';
import { CreateGameDto } from '@app/model/dto/create-game.dto';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GamesService {
    // TODO: Read JSON file or MongoDB
    private games: Game[];
    constructor(private readonly logger: Logger) {
        // private readonly logger: Logger, // @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        // TODO: Remove the populate functionality once MongoDB / FileSystem is ready
        this.games = [];
        this.start();
    }

    start(): void {
        if (this.games.length === 0) {
            this.populateDB();
        }
    }

    populateDB(): void {
        const GAMES: Game[] = [
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
        this.games = GAMES;
    }

    getAllGames(): Game[] {
        return this.games; // TODO: Read from file or Mongo
    }

    getGameById(id: number): Game {
        return this.games.find((x) => x.id === id);
    }

    addGame(newGame: CreateGameDto): void {
        // TODO: Add verifications
        this.games.push(newGame);
    }

    addGameFromJson(newGame: CreateGameDto): Game {
        // const newGame = JSON.parse(newGameStringified);
        newGame.isVisible = true;
        this.addGame(newGame);
        return newGame;
    }

    toggleGameVisibility(gameId: number): void {
        const gameToToggleVisibility = this.getGameById(gameId);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
        }
    }

    deleteGame(gameId: number): void {
        const gameToDelete = this.getGameById(gameId);
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== gameId);
        }
    }
}

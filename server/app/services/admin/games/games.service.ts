import { Game } from '@app/model/database/game';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GamesService {
    // TODO: Read JSON file or MongoDB
    private games: Game[];
    constructor(private readonly logger: Logger) {
        // private readonly logger: Logger, // @InjectModel(Game.name) public gameModel: Model<GameDocument>,
        this.games = [];
        this.start();
    }

    start() {
        if (this.games.length === 0) {
            this.populateDB();
        }
    }

    populateDB() {
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

    getGameById(id: number) {
        return this.games.find((x) => x.id === id);
    }

    addGame(newGame: Game) {
        // TODO: Add verifications
        this.games.push(newGame);
    }

    toggleGameVisibility(gameId: number) {
        const gameToToggleVisibility = this.getGameById(gameId);
        if (gameToToggleVisibility) {
            gameToToggleVisibility.isVisible = !gameToToggleVisibility.isVisible;
        }
    }

    deleteGame(gameId: number) {
        const gameToDelete = this.getGameById(gameId);
        if (gameToDelete) {
            this.games = this.games.filter((x) => x.id !== gameId);
        }
    }
}

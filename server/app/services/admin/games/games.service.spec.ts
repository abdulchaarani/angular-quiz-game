import { Game, GameDocument, gameSchema } from '@app/model/database/game';
import { Logger } from '@nestjs/common';
import { MongooseModule, getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import { GamesService } from './games.service';

const DELAY_BEFORE_CLOSING_CONNECTION = 200;
// Reference: LOG2990 Course Service Test
const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
// TODO: Add a Mock for Questions
const getFakeGame = (): Game => ({
    id: Math.random(),
    title: getRandomString(),
    description: getRandomString(),
    lastModification: new Date(2024, 1, 1),
    duration: 30,
    isVisible: true,
    questions: [],
});

describe('GamesService', () => {
    let service: GamesService;
    let gameModel: Model<GameDocument>;
    let mongoServer: MongoMemoryServer;
    let connection: Connection;

    beforeEach(async () => {
        mongoServer = await MongoMemoryServer.create();
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                MongooseModule.forRootAsync({
                    useFactory: () => ({
                        uri: mongoServer.getUri(),
                    }),
                }),
                MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
            ],
            providers: [GamesService, Logger],
        }).compile();

        service = module.get<GamesService>(GamesService);
        gameModel = module.get<Model<GameDocument>>(getModelToken(Game.name));
        connection = await module.get(getConnectionToken());
    });

    afterEach((done) => {
        setTimeout(async () => {
            await connection.close();
            await mongoServer.stop();
            done();
        }, DELAY_BEFORE_CLOSING_CONNECTION);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        expect(gameModel).toBeDefined();
    });

    it('start() should populate the database if it is empty', async () => {
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        await gameModel.deleteMany({});
        await service.start();
        expect(spyPopulateDB).toHaveBeenCalled();
    });
    it('start() should not populate the database if is not empty', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        const spyPopulateDB = jest.spyOn(service, 'populateDB');
        expect(spyPopulateDB).not.toHaveBeenCalled();
    });

    it('populateDB() should add 3 new games', async () => {
        const gamesCountBefore = await gameModel.countDocuments();
        await service.populateDB();
        const gamesCountAfter = await gameModel.countDocuments();
        const expectedCount = 3;
        expect(gamesCountAfter - gamesCountBefore).toEqual(expectedCount);
    });

    it('getAllGames() should return all games in database', async () => {
        await gameModel.deleteMany({});
        expect((await service.getAllGames()).length).toEqual(0);
        const game = getFakeGame();
        await gameModel.create(game);
        expect((await service.getAllGames()).length).toEqual(1);
    });

    it('getGameById() should return Game with the corresponding ID', async () => {
        const game = getFakeGame();
        await gameModel.create(game);
        expect(await service.getGameById(game.id)).toEqual(expect.objectContaining(game));
    });

    it('modifyGame() should fail if the corresponding game does not exist in the database', async () => {
        const game = getFakeGame();
        await expect(service.modifyGame(game)).rejects.toBeTruthy();
    });

    it('modifyGame() should fail if Mongo query failed', async () => {
        jest.spyOn(gameModel, 'updateOne').mockRejectedValue('');
        const game = getFakeGame();
        await expect(service.modifyGame(game)).rejects.toBeTruthy();
    });

    it('deleteGame() should delete the corresponding game', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await gameModel.create(game);
        await service.deleteGame(game.id);
        expect(await gameModel.countDocuments()).toEqual(0);
    });

    it('deleteGame() should fail if the game does not exist', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await expect(service.deleteGame(game.id)).rejects.toBeTruthy();
    });

    it('deleteGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'deleteOne').mockRejectedValue('');
        const game = getFakeGame();
        await expect(service.deleteGame(game.id)).rejects.toBeTruthy();
    });
    it('addGame() should add the game to the database', async () => {
        await gameModel.deleteMany({});
        const game = getFakeGame();
        await service.addGame({ ...game }); // TODO: See if it requires adjustements
        expect(await gameModel.countDocuments()).toEqual(1);
    });

    it('addGame() should fail if mongo query failed', async () => {
        jest.spyOn(gameModel, 'create').mockImplementation(async () => Promise.reject(''));
        const game = getFakeGame();
        await expect(service.addGame({ ...game })).rejects.toBeTruthy();
    });
    // TODO: Add verifications (addGame() should fail if the game is not valid)
    // TODO: Add tests for the add from JSON + Toggle Visibility features
});

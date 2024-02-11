import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { GameService } from '@app/services/game/game.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { GameController } from './game.controller';

describe('GamesController', () => {
    let controller: GameController;
    let gameService: SinonStubbedInstance<GameService>;

    beforeEach(async () => {
        gameService = createStubInstance(GameService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: gameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allGames() should return all games', async () => {
        const fakeGames = [new Game(), new Game()];
        gameService.getAllGames.resolves(fakeGames);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (courses) => {
            expect(courses).toEqual(fakeGames);
            return res;
        };

        await controller.allGames(res);
    });

    it('allGames() should return NOT_FOUND when service is unable to fetch the games', async () => {
        gameService.getAllGames.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allGames(res);
    });

    it('gameById() should return the game with the corresponding ID', async () => {
        const fakeGame = new Game();
        gameService.getGameById.resolves(fakeGame);

        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(fakeGame);
            return res;
        };

        await controller.gameById('', res);
    });

    it('gameById() should return NOT_FOUND when service is unable to fetch the game', async () => {
        gameService.getGameById.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.gameById('', res);
    });

    it('addGame() should succeed if service is able to add the game', async () => {
        gameService.addGame.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new Game(), res);
    });

    it('addGame() should return BAD_REQUEST when the game cannot be added.', async () => {
        gameService.addGame.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new Game(), res);
    });

    it('addGame() should return CONFLICT if the game already exists.', async () => {
        jest.spyOn(gameService, 'addGame').mockImplementationOnce(() => {
            return Promise.reject('Un jeu du même titre existe déjà.');
        });
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CONFLICT);
            return res;
        };
        res.send = () => res;
        await controller.addGame(new Game(), res);
    });

    it('validateQuestion() should return OK if the question is valid.', async () => {
        gameService.validateQuestion.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.validateQuestion(new Question(), res);
    });

    it('validateQuestion() should return BAD_REQUEST if the question is invalid.', async () => {
        gameService.validateQuestion.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        await controller.validateQuestion(new Question(), res);
    });

    it('toggleGameVisibility() should succeed if service is able to modify the game', async () => {
        gameService.toggleGameVisibility.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.toggleGameVisibility('', res);
    });

    it('toggleGameVisibility() should return NOT_FOUND when service cannot modify the game', async () => {
        gameService.toggleGameVisibility.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.toggleGameVisibility('', res);
    });

    it('upsertGame() should succeed if service is able to modify the game', async () => {
        gameService.upsertGame.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.send = () => res;
        await controller.upsertGame(new Game(), res);
    });

    it('upsertGame() should return BAD_REQUEST when service cannot modify the game', async () => {
        gameService.upsertGame.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.BAD_REQUEST);
            return res;
        };
        res.send = () => res;
        await controller.upsertGame(new Game(), res);
    });

    it('deleteGame() should succeed if service is able to delete the game', async () => {
        gameService.deleteGame.resolves();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        await controller.deleteGame('', res);
    });

    it('deleteGame() should return NOT_FOUND when service cannot delete the game', async () => {
        gameService.deleteGame.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.deleteGame('', res);
    });
});

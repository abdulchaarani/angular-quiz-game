import { Game } from '@app/model/database/game';
import { MatchService } from '@app/services/match/match.service';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { MatchController } from './match.controller';

describe('MatchController', () => {
    let controller: MatchController;
    let matchService: SinonStubbedInstance<MatchService>;

    beforeEach(async () => {
        matchService = createStubInstance(MatchService);
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchController],
            providers: [
                {
                    provide: MatchService,
                    useValue: matchService,
                },
            ],
        }).compile();

        controller = module.get<MatchController>(MatchController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('allVisibleGames() should return all visible games', async () => {
        const mockGames = [new Game(), new Game()];
        matchService.getAllVisibleGames.resolves(mockGames);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (games) => {
            expect(games).toEqual(mockGames);
            return res;
        };
        await controller.allVisibleGames(res);
    });

    it('allGames() should return NOT_FOUND when service is unable to fetch the games', async () => {
        matchService.getAllVisibleGames.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;

        await controller.allVisibleGames(res);
    });

    it('gameByIdWithoutIsCorrect() should return the game with the corresponding ID', async () => {
        const mockGame = new Game();
        matchService.getGameByIdWithoutIsCorrect.resolves(mockGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(mockGame);
            return res;
        };

        await controller.gameByIdWithoutIsCorrect('', res);
    });

    it('gameByIdWithoutIsCorrect() should return NOT_FOUND when service is unable to fetch the game', async () => {
        matchService.getGameByIdWithoutIsCorrect.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.gameByIdWithoutIsCorrect('', res);
    });
});

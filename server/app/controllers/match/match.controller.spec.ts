import { getMockQuestion } from '@app/constants/question-mocks';
import { Choice } from '@app/model/database/choice';
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

    it('allChoices() should return all question choices', () => {
        const mockChoices = [new Choice(), new Choice()];
        const spyGetChoices = jest.spyOn(matchService, 'getChoices').mockReturnValue(mockChoices);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (choices) => {
            expect(choices).toEqual(mockChoices);
            return res;
        };
        controller.allChoices('', '', res);
        expect(spyGetChoices).toHaveBeenCalled();
    });

    it('allChoices() should return NOT_FOUND if service cannot get choices', () => {
        const spyGetChoices = jest.spyOn(matchService, 'getChoices').mockReturnValue(undefined);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.allChoices('', '', res);
        expect(spyGetChoices).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return OK with true value in body if validatePlayerChoice returns true', () => {
        const spyGet = jest.spyOn(matchService, 'getBackupQuestion').mockReturnValue(getMockQuestion());
        const spyValidate = jest.spyOn(matchService, 'validatePlayerChoice').mockReturnValue(true);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (isValid) => {
            expect(isValid).toEqual(true);
            return res;
        };
        controller.validatePlayerChoice('', '', { selected: [''] }, res);
        expect(spyGet).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return OK with false value in body if validatePlayerChoice returns false', () => {
        const spyGet = jest.spyOn(matchService, 'getBackupQuestion').mockReturnValue(getMockQuestion());
        const spyValidate = jest.spyOn(matchService, 'validatePlayerChoice').mockReturnValue(false);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (isValid) => {
            expect(isValid).toEqual(false);
            return res;
        };
        controller.validatePlayerChoice('', '', { selected: [''] }, res);
        expect(spyGet).toHaveBeenCalled();
        expect(spyValidate).toHaveBeenCalled();
    });

    it('validatePlayerChoice() should return NOT FOUND if validatePlayerChoice does not resolve', () => {
        const spyGet = jest.spyOn(matchService, 'getBackupQuestion').mockReturnValue(undefined);
        const spyValidate = jest.spyOn(matchService, 'validatePlayerChoice');
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.validatePlayerChoice('', '', { selected: [''] }, res);
        expect(spyGet).toHaveBeenCalled();
        expect(spyValidate).not.toHaveBeenCalled();
    });

    it('getBackupGame() should return the backup game with the corresponding ID', () => {
        const mockGame = new Game();
        const spyGet = jest.spyOn(matchService, 'getBackupGame').mockReturnValue(mockGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.OK);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(mockGame);
            return res;
        };
        controller.getBackupGame('', res);
        expect(spyGet).toHaveBeenCalled();
    });
    it('getBackupGame() should return NOT_FOUND if the backup game cannot be found', () => {
        const spyGet = jest.spyOn(matchService, 'getBackupGame').mockReturnValue(undefined);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.getBackupGame('', res);
        expect(spyGet).toHaveBeenCalled();
    });
    it('saveBackupGame() should save ("create") backup game locally in the server and return a copy of the game', async () => {
        const mockGame = new Game();
        matchService.saveBackupGame.resolves(mockGame);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.CREATED);
            return res;
        };
        res.json = (game) => {
            expect(game).toEqual(mockGame);
            return res;
        };
        await controller.saveBackupGame('', res);
    });
    it('saveBackupGame() should return NOT FOUND if backup could not be saved ("created")', async () => {
        matchService.saveBackupGame.rejects();
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        await controller.saveBackupGame('', res);
    });
    it('deleteBackupGame() should delete the backup and return NO CONTENT', () => {
        const spyDelete = jest.spyOn(matchService, 'deleteBackupGame').mockReturnValue(true);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NO_CONTENT);
            return res;
        };
        res.send = () => res;
        controller.deleteBackupGame('', res);
        expect(spyDelete).toHaveBeenCalled();
    });
    it('deleteBackupGame() should return NOT FOUND if backup cannot be deleted', () => {
        const spyDelete = jest.spyOn(matchService, 'deleteBackupGame').mockReturnValue(false);
        const res = {} as unknown as Response;
        res.status = (code) => {
            expect(code).toEqual(HttpStatus.NOT_FOUND);
            return res;
        };
        res.send = () => res;
        controller.deleteBackupGame('', res);
        expect(spyDelete).toHaveBeenCalled();
    });
});

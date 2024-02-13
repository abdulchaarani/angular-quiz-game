import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';
import { of } from 'rxjs';
import { GamesService } from './games.service';

describe('GameService', () => {
    let service: GamesService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GamesService, HttpClient, HttpHandler, MatSnackBar, MatDialog, { provide: MatDialog, useClass: MatDialogMock }],
        });
        service = TestBed.inject(GamesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all games successfully with getGames()', () => {
        const spy = spyOn(service, 'getAll').and.returnValue(of(mockGames));
        service.getGames().subscribe((games: Game[]) => {
            expect(games).toEqual(mockGames);
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should get a game by id with getGameById', () => {
        const spy = spyOn(service, 'getById').and.returnValue(of(newMockGame));
        service.getGameById(newMockGame.id).subscribe((data: Game) => {
            expect(data).toEqual(newMockGame);
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error if incapable of getting game', () => {
        const spy = spyOn(service, 'getById').and.callThrough();
        service.getGameById(deletedGame.id);
        expect(spy).toThrowError();
    });

    it('should toggle visibility with toggleGameVisibility()', () => {
        const spy = spyOn(service, 'update').and.callThrough();
        const visibleGame = getFakeGame();
        service.toggleGameVisibility(visibleGame);
        expect(visibleGame.isVisible).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });

    it('should delete a game successfully with deleteGame()', () => {
        const spy = spyOn(service, 'delete').and.callThrough();
        service.deleteGame(newMockGame.id);
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error if incapable of deleting a game', () => {
        const spy = spyOn(service, 'delete').and.callThrough();
        service.deleteGame(newMockGame.id);
        expect(spy).toThrowError();
    });

    it('should upload a game successfully with uploadGame', () => {
        const spy = spyOn(service, 'add').and.callThrough();
        service.uploadGame(newMockGame);
        expect(spy).toHaveBeenCalled();
    });

    it('should throw an error if incapable of uploading a game', () => {
        const spy = spyOn(service, 'add').and.callThrough();
        service.uploadGame(deletedGame);
        expect(spy).toThrowError();
    });

    it('should replace a game successfully using replaceGame()', () => {
        const modifiedGame = getFakeGame();
        const spy = spyOn(service, 'replace').and.callThrough();
        service.replaceGame(modifiedGame);
        expect(spy).toHaveBeenCalled();
    });

    it('should submit a modified game if in modify state', () => {
        const replaceGameSpy = spyOn(service, 'replaceGame').and.callThrough();
        const uploadGameSpy = spyOn(service, 'uploadGame').and.callThrough();
        service.submitGame(newMockGame, 'modify');
        expect(replaceGameSpy).toHaveBeenCalledWith(newMockGame);
        expect(uploadGameSpy).not.toHaveBeenCalled();
    });

    it('should upload a game if not in modify state', () => {
        const replaceGameSpy = spyOn(service, 'replaceGame').and.callThrough();
        const uploadGameSpy = spyOn(service, 'uploadGame').and.callThrough();
        service.submitGame(newMockGame, 'notModify');
        expect(uploadGameSpy).toHaveBeenCalledWith(newMockGame);
        expect(replaceGameSpy).not.toHaveBeenCalled();
    });

    it('should mark pending changes', () => {
        service.markPendingChanges();
        expect(service.isPendingChangesSource.value).toBe(true);
    });

    it('should reset pending changes', () => {
        service.markPendingChanges();
        service.resetPendingChanges();
        expect(service.isPendingChangesSource.value).toBe(false);
    });
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const getFakeGame = (): Game => ({
    id: getRandomString(),
    title: getRandomString(),
    description: getRandomString(),
    lastModification: new Date().toLocaleString(),
    duration: 30,
    isVisible: true,
    questions: [
        {
            id: getRandomString(),
            type: 'QCM',
            text: getRandomString(),
            points: 30,
            choices: [
                {
                    text: getRandomString(),
                    isCorrect: true,
                },
                {
                    text: getRandomString(),
                    isCorrect: false,
                },
            ],
            lastModification: new Date().toLocaleString(),
        },
    ],
});
const mockGames = [getFakeGame(), getFakeGame()];
const newMockGame = getFakeGame();
const deletedGame = {} as Game;

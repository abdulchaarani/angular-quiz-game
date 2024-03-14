import { HttpClient, HttpErrorResponse, HttpHandler, HttpResponse } from '@angular/common/http';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ManagementState } from '@app/constants/states';
import { Game } from '@app/interfaces/game';
import { NotificationService } from '@app/services/notification/notification.service';
import { of, throwError } from 'rxjs';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;
    let notificationSpy: jasmine.SpyObj<NotificationService>;
    let dialogMock: jasmine.SpyObj<MatDialog>;

    beforeEach(waitForAsync(() => {
        notificationSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);
        dialogMock = jasmine.createSpyObj({
            open: jasmine.createSpyObj({
                afterClosed: of('mockResult'),
            }),
        });
        TestBed.configureTestingModule({
            providers: [
                GameService,
                HttpClient,
                HttpHandler,
                MatSnackBar,
                MatDialog,
                { provide: MatDialog, useValue: dialogMock },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });
        service = TestBed.inject(GameService);
        service.games = mockGames;
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all games successfully with getGames()', () => {
        const spy = spyOn(service, 'getAll').and.returnValue(of(mockGames));
        service.getGames();
        expect(spy).toHaveBeenCalled();
        expect(service.games).toEqual(mockGames);
    });

    it('should display error message if service cannot get all games', () => {
        const spy = spyOn(service, 'getAll').and.returnValue(throwError(() => new Error('error')));
        service.getGames();
        expect(service.games).toEqual(mockGames);
        expect(spy).toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should get a game by id with getGameById', () => {
        const spy = spyOn(service, 'getById').and.returnValue(of(newMockGame));
        service.getGameById(newMockGame.id).subscribe((data: Game) => {
            expect(data).toEqual(newMockGame);
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should toggle visibility with toggleGameVisibility()', () => {
        const spy = spyOn(service, 'update').and.returnValue(of(mockHttpResponse));
        const visibleGame = getFakeGame();
        service.toggleGameVisibility(visibleGame);
        expect(visibleGame.isVisible).toBeFalsy();
        expect(spy).toHaveBeenCalled();
    });

    it('should add a game successfully with addGame()', () => {
        const spy = spyOn(service, 'add').and.returnValue(of(mockHttpResponse));
        service.uploadGame(newMockGame);
        expect(spy).toHaveBeenCalled();
    });

    it('should be able to add a game (with no body in the response) and display success message', () => {
        const spy = spyOn(service, 'addGame').and.returnValue(of(mockHttpResponse));
        service.uploadGame(newMockGame);
        expect(spy).toHaveBeenCalledWith(newMockGame);
        // expect(service.games.length).toBe(mockGames.length + 1);
        expect(notificationSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should be able to add a game (with appropriate body in the response) and display success message', () => {
        const mockHttpResponseWithBody: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(newMockGame) });
        const addSpy = spyOn(service, 'addGame').and.returnValue(of(mockHttpResponseWithBody));
        service.uploadGame(newMockGame);
        // expect(service.games.length).toBe(mockGames.length + 1);
        expect(addSpy).toHaveBeenCalled();
        expect(notificationSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should not add the game if it already exists and open dialog to ask to rename the game title', () => {
        const httpError = new HttpErrorResponse({
            status: 409,
            error: { code: '409', message: 'Requête add\n Un jeu du même titre existe déjà.' },
        });
        const addSpy = spyOn(service, 'addGame').and.returnValue(throwError(() => httpError));
        const openDialogSpy = spyOn(service, 'openDialog');
        service.uploadGame(newMockGame);
        expect(openDialogSpy).toHaveBeenCalledWith(newMockGame);
        expect(addSpy).toHaveBeenCalled();
    });

    it('should not add the game if it already exists and open dialog to ask to rename the game title', () => {
        const httpError = new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
        });
        const addSpy = spyOn(service, 'addGame').and.returnValue(throwError(() => httpError));
        service.uploadGame(newMockGame);
        expect(addSpy).toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should open a snackbar if uploadGame fails', () => {
        const addSpy = spyOn(service, 'addGame').and.returnValue(throwError(() => new Error('error')));
        service.uploadGame(newMockGame);
        expect(addSpy).toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should replace a game successfully using replaceGame()', () => {
        const modifiedGame = getFakeGame();
        const spy = spyOn(service, 'put').and.returnValue(of(mockHttpResponse));
        service.replaceGame(modifiedGame);
        expect(spy).toHaveBeenCalled();
    });

    it('should submit a modified game if in modify state', () => {
        const replaceGameSpy = spyOn(service, 'replaceGame').and.returnValue(of(mockHttpResponse));
        const uploadGameSpy = spyOn(service, 'addGame').and.returnValue(of(mockHttpResponse));
        service.submitGame(newMockGame, ManagementState.GameModify);
        expect(replaceGameSpy).toHaveBeenCalledWith(newMockGame);
        expect(uploadGameSpy).not.toHaveBeenCalled();
    });

    it('should upload a game if not in create state', () => {
        const replaceGameSpy = spyOn(service, 'replaceGame').and.returnValue(of(mockHttpResponse));
        const uploadGameSpy = spyOn(service, 'addGame').and.returnValue(of(mockHttpResponse));
        service.submitGame(newMockGame, ManagementState.GameCreate);
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

    it('onFileSelected should call readFile()', () => {
        const readFileSpy = spyOn(service, 'readFile');
        const dataTransfer = new DataTransfer();
        const mockFile = new File([JSON.stringify(newMockGame)], 'file.json', { type: 'application/json' });
        dataTransfer.items.add(mockFile);
        const mockEvent = {
            dataTransfer,
            target: { files: dataTransfer },
        } as unknown as InputEvent;
        service.onFileSelected(mockEvent);
        expect(readFileSpy).toHaveBeenCalled();
    });

    it('readFile() should call addStringifiedGame()', waitForAsync(async () => {
        // Reference: https://stackoverflow.com/questions/64642547/how-can-i-test-the-filereader-onload-callback-function-in-angular-jasmine
        const addStringifiedGameSpy = spyOn(service, 'addStringifiedGame');
        const mockFile = new File([JSON.stringify(newMockGame)], 'file.json', { type: 'application/json' });
        await service.readFile(mockFile).then(() => {
            expect(addStringifiedGameSpy).toHaveBeenCalled();
        });
    }));

    it('addStringifiedGame() should parse the stringified game and call uploadGame()', () => {
        const addGameSpy = spyOn(service, 'uploadGame');
        const mockGameStringified = JSON.stringify(newMockGame);
        service.addStringifiedGame(mockGameStringified);
        expect(addGameSpy).toHaveBeenCalledWith(JSON.parse(mockGameStringified));
    });

    it('openDialog() should open a dialog asking to change the game title and resubmit the updated game', () => {
        const addGameSpy = spyOn(service, 'uploadGame');
        service.openDialog(newMockGame);
        expect(dialogMock.open).toHaveBeenCalled();
        const closeDialog = () => {
            return dialogMock.closeAll;
        };
        closeDialog();
        const changedTitleMockGame = newMockGame;
        changedTitleMockGame.title = 'mockResult';
        expect(addGameSpy).toHaveBeenCalledWith(changedTitleMockGame);
    });

    it('should be able to delete a game from the list', () => {
        const deleteSpy = spyOn(service, 'delete').and.returnValue(of(mockHttpResponse));
        const gameToDeleteId = service.games[0].id;
        service.deleteGame(gameToDeleteId);
        expect(deleteSpy).toHaveBeenCalled();
        expect(service.games.length).toBe(mockGames.length - 1);
    });

    it('should open a snackbar if ondDeleteGameFromList fails', () => {
        const deleteSpy = spyOn(service, 'delete').and.returnValue(throwError(() => new Error('error')));
        service.deleteGame('');
        expect(deleteSpy).toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
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
const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(newMockGame) });

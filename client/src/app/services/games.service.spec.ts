import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/interfaces/game';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';
import { of } from 'rxjs';
import { GamesService } from './games.service';
import { NotificationService } from './notification.service';

describe('GameService', () => {
    let service: GamesService;
    let notificationService: NotificationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GamesService,
                HttpClient,
                HttpHandler,
                MatSnackBar,
                MatDialog,
                NotificationService,
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        });
        service = TestBed.inject(GamesService);
        notificationService = TestBed.inject(NotificationService);
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

    it('formatGameToExport() should return a stringified game without isVisible property', () => {
        const mockGame: Game = {
            id: 'mock',
            title: 'mock',
            description: 'mock',
            lastModification: 'mock',
            duration: 1,
            isVisible: true,
            questions: [],
        };
        const stringifiedMockGame = '{"id":"mock","title":"mock","description":"mock","lastModification":"mock","duration":1,"questions":[]}';
        const result = service.formatGameToExport(mockGame);
        expect(result).toEqual(stringifiedMockGame);
    });

    it('useDownloadLink() should edit the url and download properties and click the anchor', () => {
        const mockUrl = 'mock';
        const anchor: HTMLAnchorElement = document.createElement('a');
        const spyClick = spyOn(anchor, 'click');
        const expectedUrl = `http://${location.host}/${mockUrl}`;
        const result = service.useDownloadLink(newMockGame, anchor, mockUrl);
        expect(result.href).toEqual(expectedUrl);
        expect(result.download).toEqual(`${newMockGame.title}.json`);
        expect(spyClick).toHaveBeenCalled();
    });

    // Ref : https://stackoverflow.com/questions/59062023/how-to-mock-a-pdf-blob
    // Ref : https://stackoverflow.com/questions/61142428/angular-test-mock-a-httpresponse-containing-a-blob
    it('should return a game as JSON without isVisible, _id or __v attributes', () => {
        const stringifiedGame = JSON.stringify(newMockGame);
        const mockBlob = new Blob([stringifiedGame], { type: 'text/json' });
        const createObjectUrlSpy = spyOn(window.URL, 'createObjectURL').and.returnValue('');
        const revokeObjectSpy = spyOn(window.URL, 'revokeObjectURL');
        const useDownloadLinkSpy = spyOn(service, 'useDownloadLink').and.returnValue(document.createElement('a'));
        service.downloadGameAsJson(newMockGame);
        expect(createObjectUrlSpy).toHaveBeenCalledWith(mockBlob);
        expect(useDownloadLinkSpy).toHaveBeenCalled();
        expect(revokeObjectSpy).toHaveBeenCalled();
    });

    it('should open a snackbar to display a success message', () => {
        const notificationSpy = spyOn(notificationService, 'displaySuccessMessage');
        const mockMessage = 'mock';
        service.displaySuccessMessage(mockMessage);
        expect(notificationSpy).toHaveBeenCalledWith(mockMessage);
    });

    it('should displayErrorMessage() should display an error message', () => {
        const notificationSpy = spyOn(notificationService, 'displayErrorMessage');
        const mockMessage = 'mock';
        service.displayErrorMessage(mockMessage);
        expect(notificationSpy).toHaveBeenCalledWith(mockMessage);
    });

    it('should open confirm dialog to confirm bank upload', () => {
        const notificationSpy = spyOn(notificationService, 'openConfirmDialog');
        const mockTitle = 'mockTitle';
        service.confirmBankUpload(mockTitle);
        const mockData = {
            icon: 'info_outline',
            title: 'Êtes-vous certain de vouloir ajouter cette question à la banque de questions?',
            text: mockTitle,
        };
        expect(notificationSpy).toHaveBeenCalledWith({ data: mockData });
    });

    it('should open create question modal', () => {
        const notificationSpy = spyOn(notificationService, 'openCreateQuestionModal');
        service.openCreateQuestionModal();
        expect(notificationSpy).toHaveBeenCalled();
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

import { HttpClient, HttpErrorResponse, HttpHandler, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogRenameGameComponent } from '@app/components/dialog-rename-game/dialog-rename-game.component';
import { GameListItemComponent } from '@app/components/game-list-item/game-list-item.component';
import { getMockGame } from '@app/constants/game-mocks';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

const MOCK_GAMES = [getMockGame(), getMockGame()];
const MOCK_GAME = getMockGame();

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gamesServiceSpy: SpyObj<GamesService>;
    let notificationServiceSpy: SpyObj<NotificationService>;
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK' });
    let dialogMock: SpyObj<MatDialog>;

    beforeEach(waitForAsync(() => {
        dialogMock = jasmine.createSpyObj({
            open: jasmine.createSpyObj({
                afterClosed: of('mockResult'),
            }),
        });
        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
        ]);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);

        gamesServiceSpy.getGames.and.returnValue(of(MOCK_GAMES));
        gamesServiceSpy.uploadGame.and.returnValue(of(mockHttpResponse));
        gamesServiceSpy.deleteGame.and.returnValue(of(mockHttpResponse));

        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSnackBarModule, RouterTestingModule, MatIconModule, MatCardModule],
            declarations: [AdminPageComponent, GameListItemComponent],
            providers: [
                HttpClient,
                HttpHandler,
                { provide: MatDialog, useValue: dialogMock },
                { provide: GamesService, useValue: gamesServiceSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch games after initialiation', () => {
        expect(component.games.length).toEqual(MOCK_GAMES.length);
    });

    it('should open a snackbar if getGames fails', () => {
        gamesServiceSpy.getGames.and.returnValue(throwError(() => new Error('error')));
        component.getGames();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should be able to delete a game from the list', () => {
        const gameToDeleteId = component.games[0].id;
        component.onDeleteGameFromList(gameToDeleteId);

        expect(gamesServiceSpy.deleteGame).toHaveBeenCalledWith(gameToDeleteId);
        expect(component.games.length).toBe(MOCK_GAMES.length - 1);
    });

    it('should open a snackbar if ondDeleteGameFromList fails', () => {
        gamesServiceSpy.deleteGame.and.returnValue(throwError(() => new Error('error')));
        component.onDeleteGameFromList('');
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should be able to add a game (with no body in the response) and display success message', () => {
        component.addGame(MOCK_GAME);
        expect(gamesServiceSpy.uploadGame).toHaveBeenCalledWith(MOCK_GAME);
        expect(component.games.length).toBe(MOCK_GAMES.length + 1);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should be able to add a game (with appropriate body in the response) and display success message', () => {
        const mockHttpResponseWithBody: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(MOCK_GAME) });
        gamesServiceSpy.uploadGame.and.returnValue(of(mockHttpResponseWithBody));
        component.addGame(MOCK_GAME);
        expect(gamesServiceSpy.uploadGame).toHaveBeenCalledWith(MOCK_GAME);
        expect(component.games.length).toBe(MOCK_GAMES.length + 1);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should not add the game if it already exists and open dialog to ask to rename the game title', () => {
        const httpError = new HttpErrorResponse({
            status: 409,
            error: { code: '409', message: 'Requête add\n Un jeu du même titre existe déjà.' },
        });
        gamesServiceSpy.uploadGame.and.returnValue(throwError(() => httpError));
        const openDialogSpy = spyOn(component, 'openDialog');
        component.addGame(MOCK_GAME);
        expect(openDialogSpy).toHaveBeenCalledWith(MOCK_GAME);
        expect(notificationServiceSpy.displayErrorMessage).not.toHaveBeenCalled();
    });

    it('should not add the game if it already exists and open dialog to ask to rename the game title', () => {
        const httpError = new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
        });
        gamesServiceSpy.uploadGame.and.returnValue(throwError(() => httpError));
        component.addGame(MOCK_GAME);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should open a snackbar if addGame fails', () => {
        gamesServiceSpy.uploadGame.and.returnValue(throwError(() => new Error('error')));
        component.addGame(MOCK_GAME);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('onFileSelected should call readFile()', () => {
        const readFileSpy = spyOn(component, 'readFile');
        const dataTransfer = new DataTransfer();
        const mockFile = new File([JSON.stringify(MOCK_GAME)], 'file.json', { type: 'application/json' });
        dataTransfer.items.add(mockFile);
        const mockEvent = {
            dataTransfer,
            target: { files: dataTransfer },
        } as unknown as InputEvent;
        component.onFileSelected(mockEvent);
        expect(readFileSpy).toHaveBeenCalled();
    });

    it('readFile() should call addStringifiedGame()', waitForAsync(async () => {
        // Reference: https://stackoverflow.com/questions/64642547/how-can-i-test-the-filereader-onload-callback-function-in-angular-jasmine
        const addStringifiedGameSpy = spyOn(component, 'addStringifiedGame');
        const mockFile = new File([JSON.stringify(MOCK_GAME)], 'file.json', { type: 'application/json' });
        await component.readFile(mockFile).then(() => {
            expect(addStringifiedGameSpy).toHaveBeenCalled();
        });
    }));

    it('addStringifiedGame() should parse the stringified game and call addGame()', () => {
        const addGameSpy = spyOn(component, 'addGame');
        const mockGameStringified = JSON.stringify(MOCK_GAME);
        component.addStringifiedGame(mockGameStringified);
        expect(addGameSpy).toHaveBeenCalledWith(JSON.parse(mockGameStringified));
    });

    it('addStringifiedGame() should not add the game if it is undefined', () => {
        const addGameSpy = spyOn(component, 'addGame');
        component.addStringifiedGame('');
        expect(addGameSpy).not.toHaveBeenCalled();
    });

    it('openDialog() should open a dialog asking to change the game title and resubmit the updated game', () => {
        const addGameSpy = spyOn(component, 'addGame');
        component.openDialog(MOCK_GAME);
        expect(dialogMock.open).toHaveBeenCalledWith(DialogRenameGameComponent, {
            data: '',
        });
        const closeDialog = () => {
            return dialogMock.closeAll;
        };
        closeDialog();
        const changedTitleMockGame = MOCK_GAME;
        changedTitleMockGame.title = 'mockResult';
        expect(addGameSpy).toHaveBeenCalledWith(changedTitleMockGame);
    });
});

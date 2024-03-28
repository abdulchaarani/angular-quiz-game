import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SnackBarError } from '@app/constants/feedback-messages';
import { getMockGame } from '@app/constants/game-mocks';
import { MatDialogMock } from '@app/constants/mat-dialog-mock';
import { MatchContext } from '@app/constants/states';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { of, throwError } from 'rxjs';
import { MatchCreationPageComponent } from './match-creation-page.component';
import SpyObj = jasmine.SpyObj;

describe('MatchCreationPageComponent', () => {
    let component: MatchCreationPageComponent;
    let fixture: ComponentFixture<MatchCreationPageComponent>;
    let gameService: GameService;
    let notificationSpy: SpyObj<NotificationService>;
    let questionContextSpy: SpyObj<QuestionContextService>;

    const invisibleGame: Game = { isVisible: false } as Game;
    const fakeGame: Game = getMockGame();

    const action = 'Actualiser';

    const snackBarMock = {
        onAction: () => {
            return of(undefined);
        },
    } as MatSnackBarRef<TextOnlySnackBar>;

    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(true) });

    const matchServiceSpy = jasmine.createSpyObj('MatchService', ['validateChoices', 'getAllGames', 'saveBackupGame', 'createMatch']);
    matchServiceSpy.getAllGames.and.returnValue(of([fakeGame]));
    matchServiceSpy.saveBackupGame.and.returnValue(of(mockHttpResponse));
    matchServiceSpy.validateChoices.and.returnValue(of(mockHttpResponse));

    beforeEach(() => {
        notificationSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessageAction', 'openSnackBar']);
        questionContextSpy = jasmine.createSpyObj('QuestionContextService', ['setContext']);

        TestBed.configureTestingModule({
            declarations: [MatchCreationPageComponent],
            imports: [HttpClientTestingModule, BrowserAnimationsModule, ScrollingModule],
            providers: [
                GameService,
                { provide: NotificationService, useValue: notificationSpy },
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: QuestionContextService, useValue: questionContextSpy },
            ],
        });
        fixture = TestBed.createComponent(MatchCreationPageComponent);
        gameService = TestBed.inject(GameService);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games on init', () => {
        expect(component.games).toBeDefined();
    });

    it('should load only visible games on init', () => {
        component.ngOnInit();
        const games = component.games;
        const isNotVisible = games.some((game) => !game.isVisible);
        expect(isNotVisible).toBeFalsy();
    });

    it('should load only visible games with reloadAllGames()', fakeAsync(() => {
        component.reloadAllGames();
        component.games = [fakeGame, invisibleGame];
        component.reloadAllGames();
        tick();
        const games = component.games;
        const expectedGames = [fakeGame];
        expect(games).toEqual(expectedGames);
        expect(invisibleGame.isVisible).toBeFalsy();
        flush();
    }));

    it('should load a visible selected game', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.validateGame(fakeGame);
        component.loadSelectedGame(fakeGame);
        expect(component.selectedGame).toEqual(fakeGame);
        expect(component.gameIsValid).toBeTruthy();
    }));

    it('should reload a visible selected game', fakeAsync(() => {
        component.selectedGame = fakeGame;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.revalidateGame();
        component.reloadSelectedGame();
        expect(component.selectedGame).toEqual(fakeGame);
        expect(component.gameIsValid).toBeTruthy();
    }));

    it('should not load an invisible selected game', fakeAsync(() => {
        spyOn(gameService, 'getGameById').and.returnValue(of(invisibleGame));
        const spy = spyOn(component, 'validateGame');
        component.loadSelectedGame(invisibleGame);
        tick();
        expect(spy).toHaveBeenCalledWith(invisibleGame);
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should not reload an invisible selected game', fakeAsync(() => {
        component.selectedGame = invisibleGame;
        spyOn(gameService, 'getGameById').and.returnValue(of(invisibleGame));
        const spy = spyOn(component, 'revalidateGame');
        component.reloadSelectedGame();
        tick();
        expect(spy).toHaveBeenCalled();
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should not load a deleted selected game', fakeAsync(() => {
        notificationSpy.displayErrorMessageAction.and.returnValue(snackBarMock);
        spyOn(gameService, 'getGameById').and.returnValue(throwError(() => new Error('error')));
        const spy = spyOn(component, 'validateGame');
        component.loadSelectedGame({ id: '' } as Game);
        tick();
        expect(spy).not.toHaveBeenCalled();
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should not reload a deleted selected game', fakeAsync(() => {
        component.selectedGame = {} as Game;
        const spy = spyOn(component, 'revalidateGame');
        component.reloadSelectedGame();
        tick();
        expect(spy).not.toHaveBeenCalled();
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should open a snackbar when selecting an invisible game', fakeAsync(() => {
        notificationSpy.displayErrorMessageAction.and.returnValue(snackBarMock);
        component.validateGame(invisibleGame);
        tick();
        expect(notificationSpy.displayErrorMessageAction).toHaveBeenCalledWith(SnackBarError.INVISIBLE, action);
        flush();
    }));

    it('should open a snackbar when revalidating an invisible game', fakeAsync(() => {
        notificationSpy.displayErrorMessageAction.and.returnValue(snackBarMock);
        component.selectedGame = invisibleGame;
        component.revalidateGame();
        tick();
        expect(notificationSpy.displayErrorMessageAction).toHaveBeenCalledWith(SnackBarError.INVISIBLE, action);
        flush();
    }));

    it('should open a snackbar when selecting a deleted game', fakeAsync(() => {
        notificationSpy.displayErrorMessageAction.and.returnValue(snackBarMock);
        spyOn(gameService, 'getGameById').and.returnValue(throwError(() => new Error('error')));
        component.loadSelectedGame({ id: '' } as Game);
        expect(notificationSpy.displayErrorMessageAction).toHaveBeenCalledWith(SnackBarError.DELETED, action);
        flush();
    }));

    it('should open a snackbar when revalidating a deleted game', fakeAsync(() => {
        component.selectedGame = { id: '' } as Game;
        notificationSpy.displayErrorMessageAction.and.returnValue(snackBarMock);
        spyOn(gameService, 'getGameById').and.returnValue(throwError(() => new Error('error')));
        component.reloadSelectedGame();
        expect(notificationSpy.displayErrorMessageAction).toHaveBeenCalledWith(SnackBarError.DELETED, action);
        flush();
    }));

    it('should select game without errors if game is visible and defined. No snackbars should open', fakeAsync(() => {
        component.validateGame(fakeGame);
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.loadSelectedGame(fakeGame);
        tick();
        expect(component.selectedGame).toEqual(fakeGame);
        expect(component.gameIsValid).toBeTruthy();
        expect(notificationSpy.displayErrorMessageAction).not.toHaveBeenCalled();
        flush();
    }));

    it('createMatch() should create a playing match', () => {
        const reloadSpy = spyOn(component, 'reloadSelectedGame');
        component.createMatch(MatchContext.HostView);
        expect(reloadSpy).toHaveBeenCalled();
    });

    it('createMatch() should create a test match if testGame is set to true', () => {
        const reloadSpy = spyOn(component, 'reloadSelectedGame');
        component.createMatch(MatchContext.TestPage);
        expect(reloadSpy).toHaveBeenCalled();
        expect(questionContextSpy.setContext).toHaveBeenCalled();
    });
});

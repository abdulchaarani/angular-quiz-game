import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogMock } from '@app/constants/mat-dialog-mock';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/game/games.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { of, throwError } from 'rxjs';
import { HostPageComponent } from './host-page.component';
// import { HttpResponse } from '@angular/common/http';

describe('HostPageComponent', () => {
    let component: HostPageComponent;
    let fixture: ComponentFixture<HostPageComponent>;
    let gameService: GamesService;
    let notificationService: NotificationService;
    const invisibleGame: Game = { isVisible: false } as Game;
    const fakeGame: Game = {
        id: '0',
        title: 'title',
        description: 'desc',
        lastModification: 'new Date(YEAR, 1, 1)',
        duration: 30,
        isVisible: true,
        questions: [
            {
                id: 'getRandomString',
                type: 'QCM',
                text: 'getRandomString',
                points: 30,
                choices: [],
                lastModification: ' new Date(YEAR, 1, 1)',
            },
        ],
    };
    const deletedError = "Le jeu sélectionné n'existe plus";
    const invisibleError = "Le jeu sélectionné n'est plus visible";
    const action = 'Actualiser';

    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(true) });

    const matchServiceSpy = jasmine.createSpyObj('MatchService', ['validateChoices', 'getAllGames', 'saveBackupGame']);
    matchServiceSpy.getAllGames.and.returnValue(of([fakeGame]));
    matchServiceSpy.saveBackupGame.and.returnValue(of(mockHttpResponse));
    matchServiceSpy.validateChoices.and.returnValue(of(mockHttpResponse));

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostPageComponent],
            imports: [HttpClientTestingModule, BrowserAnimationsModule, ScrollingModule],
            providers: [
                MatSnackBar,
                GamesService,
                NotificationService,
                { provide: MatchService, useValue: matchServiceSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        });
        fixture = TestBed.createComponent(HostPageComponent);
        gameService = TestBed.inject(GamesService);
        notificationService = TestBed.inject(NotificationService);
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

    it('should not load an invisible selected game', fakeAsync(() => {
        spyOn(gameService, 'getGameById').and.returnValue(of(invisibleGame));
        const spy = spyOn(component, 'validateGame');
        component.loadSelectedGame(invisibleGame);
        tick();
        expect(spy).toHaveBeenCalledWith(invisibleGame);
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should not load a deleted selected game', fakeAsync(() => {
        spyOn(gameService, 'getGameById').and.returnValue(throwError(() => new Error('error')));
        const spy = spyOn(component, 'validateGame');
        component.loadSelectedGame({ id: '' } as Game);
        tick();
        expect(spy).not.toHaveBeenCalled();
        expect(component.gameIsValid).toBeFalsy();
        flush();
    }));

    it('should open a snackbar when selecting an invisible game', fakeAsync(() => {
        const notificationSpy = spyOn(notificationService, 'displayErrorMessageAction').and.callThrough();
        component.validateGame(invisibleGame);
        tick();
        expect(notificationSpy).toHaveBeenCalledWith(invisibleError, action);
        flush();
    }));

    it('should open a snackbar when selecting a deleted game', fakeAsync(() => {
        const notificationSpy = spyOn(notificationService, 'displayErrorMessageAction').and.callThrough();
        spyOn(gameService, 'getGameById').and.returnValue(throwError(() => new Error('error')));
        component.loadSelectedGame({ id: '' } as Game);
        expect(notificationSpy).toHaveBeenCalledWith(deletedError, action);
        flush();
    }));

    it('should select game without errors if game is visible and defined. No snackbars should open', fakeAsync(() => {
        component.validateGame(fakeGame);
        const notificationSpy = spyOn(notificationService, 'displayErrorMessageAction').and.callThrough();
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.loadSelectedGame(fakeGame);
        tick();
        expect(component.selectedGame).toEqual(fakeGame);
        expect(component.gameIsValid).toBeTruthy();
        expect(notificationSpy).not.toHaveBeenCalled();
        flush();
    }));
});

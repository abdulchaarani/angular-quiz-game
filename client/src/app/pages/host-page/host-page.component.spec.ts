import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { NotificationService } from '@app/services/notification.service';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';
import { of, throwError } from 'rxjs';
import { HostPageComponent } from './host-page.component';

describe('HostPageComponent', () => {
    let component: HostPageComponent;
    let fixture: ComponentFixture<HostPageComponent>;
    let gameService: GamesService;
    let notificationService: NotificationService;
    let matchService: MatchService;
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

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HostPageComponent],
            imports: [HttpClientTestingModule, BrowserAnimationsModule],
            providers: [MatSnackBar, GamesService, NotificationService, MatchService, { provide: MatDialog, useClass: MatDialogMock }],
        });
        fixture = TestBed.createComponent(HostPageComponent);
        gameService = TestBed.inject(GamesService);
        notificationService = TestBed.inject(NotificationService);
        matchService = TestBed.inject(MatchService);
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
        const spy = spyOn(component, 'reloadAllGames').and.callThrough();
        spyOn(matchService, 'getAllGames').and.returnValue(of([fakeGame]));
        component.games = [fakeGame, invisibleGame];
        component.reloadAllGames();
        tick();
        const games = component.games;
        const expectedGames = [fakeGame];
        expect(games).toEqual(expectedGames);
        expect(invisibleGame.isVisible).toBeFalsy();
        expect(spy).toHaveBeenCalled();

        flush();
    }));

    it('should load a visible selected game', fakeAsync(() => {
        const spy = spyOn(component, 'validateGame').and.callThrough();
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.loadSelectedGame(fakeGame);
        expect(component.selectedGame).toEqual(fakeGame);
        expect(spy).toHaveBeenCalledWith(fakeGame);
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
        const spy = spyOn(component, 'validateGame').and.callThrough();
        const notificationSpy = spyOn(notificationService, 'displayErrorMessageAction').and.callThrough();
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));
        component.loadSelectedGame(fakeGame);
        tick();
        expect(component.selectedGame).toEqual(fakeGame);
        expect(spy).toHaveBeenCalledWith(fakeGame);
        expect(component.gameIsValid).toBeTruthy();
        expect(notificationSpy).not.toHaveBeenCalled();
        flush();
    }));
});

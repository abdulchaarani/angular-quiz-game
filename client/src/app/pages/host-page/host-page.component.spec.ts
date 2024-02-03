import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GamesService } from '@app/services/games.service';
// import { NotificationService } from '@app/services/notification.service';

import { Game } from '@app/interfaces/game';
import { of } from 'rxjs';
import { HostPageComponent } from './host-page.component';

describe('HostPageComponent', () => {
    let component: HostPageComponent;
    let fixture: ComponentFixture<HostPageComponent>;
    let gameService: GamesService;
    // let notificationService: NotificationService;
    // let mockGameService: jasmine.SpyObj<GamesService>;
    // const invisibleGame = { isVisible: false } as Game;
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
                description: 'getRandomString',
                question: 'getRandomString',
                points: 30,
                choices: [],
                lastModification: ' new Date(YEAR, 1, 1)',
            },
        ],
    };
    // });
    // const deletedError = "Le jeu sélectionné n'existe plus";
    // const invisibleError = "Le jeu sélectionné n'est plus visible";

    beforeEach(() => {
        // mockGameService = jasmine.createSpyObj(['getGameById']);
        TestBed.configureTestingModule({
            declarations: [HostPageComponent],
            imports: [HttpClientTestingModule, BrowserAnimationsModule],
            providers: [MatSnackBar, GamesService],
        });
        fixture = TestBed.createComponent(HostPageComponent);
        gameService = TestBed.inject(GamesService);
        // notificationService = TestBed.inject(NotificationService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games', () => {
        expect(component.games).toBeDefined();
    });

    it('should load selected game', fakeAsync(() => {
        spyOn(gameService, 'getGameById').and.returnValue(of(fakeGame));

        component.loadSelectedGame(fakeGame);
        tick();
        expect(component.selectedGame).toEqual(fakeGame);
    }));

    // it('should load only visible games', () => {
    //     component.ngOnInit();
    //     const games = component.games;

    //     const isNotVisible = games.some((game) => !game.isVisible);

    //     expect(isNotVisible).toBeFalsy();
    // });

    it('games loaded from loadGames() should not contain invisible games', () => {
        component.loadAllGames();
        const games = component.games;

        const isNotVisible = games.some((game) => !game.isVisible);

        expect(isNotVisible).toBeFalsy();
    });

    // it('should open snackbar when selecting an invisible game and call loadGames()', fakeAsync(() => {
    //     spyOn(component.snackBar, 'open').and.callThrough();
    //     spyOn(component, 'loadGames');

    //     component.selectGame(invisibleGame);
    //     tick();
    //     expect(component.snackBar.open).toHaveBeenCalledWith(invisibleError, 'Actualiser');

    //     const snackBarRef = component.snackBar.open(invisibleError, 'Actualiser');
    //     expect(snackBarRef.onAction).toBeTruthy();

    //     snackBarRef.onAction()?.subscribe(() => {
    //         expect(component.loadGames).toHaveBeenCalled();
    //     });
    // }));

    // it('should open snackbar when selecting a deleted game and call loadGames()', fakeAsync(() => {
    //     spyOn(component.snackBar, 'open').and.callThrough();
    //     spyOn(component, 'loadGames');
    //     const test = spyOn(component, 'loadSelectedGame').and.returnValue(undefined);

    //     // expect(mockGameService).toHaveBeenCalled();

    //     component.selectGame(undefined);

    //     tick();
    //     expect(component.snackBar.open).toHaveBeenCalledWith(deletedError, 'Actualiser');

    //     const snackBarRef = component.snackBar.open(deletedError, 'Actualiser');
    //     expect(snackBarRef.onAction).toBeTruthy();

    //     snackBarRef.onAction()?.subscribe(() => {
    //         expect(component.loadGames).toHaveBeenCalled();
    //     });
    // }));

    // it('should select game without errors if game is visible and defined', fakeAsync(() => {
    //     spyOn(component.snackBar, 'open').and.callThrough();
    //     spyOn(component, 'loadGames');

    //     component.selectGame(realGame);
    //     tick();
    //     expect(component.snackBar.open).not.toHaveBeenCalledWith(deletedError, 'Actualiser');
    //     expect(component.snackBar.open).not.toHaveBeenCalledWith(invisibleError, 'Actualiser');
    //     expect(component.loadGames).not.toHaveBeenCalled();
    // }));
});

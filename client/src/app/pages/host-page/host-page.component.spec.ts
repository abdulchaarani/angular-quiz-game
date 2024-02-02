import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Game } from '@app/interfaces/game';
import { HostPageComponent } from './host-page.component';

describe('HostPageComponent', () => {
    let component: HostPageComponent;
    let fixture: ComponentFixture<HostPageComponent>;
    // let mockGameService: jasmine.SpyObj<GamesService>;
    const invisibleGame = { isVisible: false } as Game;
    const realGame = { isVisible: true } as Game;
    const deletedError = "Le jeu sélectionné n'existe plus";
    const invisibleError = "Le jeu sélectionné n'est plus visible";

    beforeEach(() => {
        // mockGameService = jasmine.createSpyObj(['getGameById']);
        TestBed.configureTestingModule({
            declarations: [HostPageComponent],
            imports: [HttpClientTestingModule, BrowserAnimationsModule],
            providers: [MatSnackBar],
        });
        fixture = TestBed.createComponent(HostPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load games', () => {
        expect(component.games).toBeDefined();
    });

    it('should load only visible games', () => {
        component.ngOnInit();
        const games = component.games;

        const isNotVisible = games.some((game) => !game.isVisible);

        expect(isNotVisible).toBeFalsy();
    });

    it('games loaded from loadGames() should not contain invisible games', () => {
        component.loadGames();
        const games = component.games;

        const isNotVisible = games.some((game) => !game.isVisible);

        expect(isNotVisible).toBeFalsy();
    });

    it('should open snackbar when selecting an invisible game and call loadGames()', fakeAsync(() => {
        spyOn(component.snackBar, 'open').and.callThrough();
        spyOn(component, 'loadGames');

        component.selectGame(invisibleGame);
        tick();
        expect(component.snackBar.open).toHaveBeenCalledWith(invisibleError, 'Actualiser');

        const snackBarRef = component.snackBar.open(invisibleError, 'Actualiser');
        expect(snackBarRef.onAction).toBeTruthy();

        snackBarRef.onAction()?.subscribe(() => {
            expect(component.loadGames).toHaveBeenCalled();
        });
    }));

    it('should open snackbar when selecting a deleted game and call loadGames()', fakeAsync(() => {
        spyOn(component.snackBar, 'open').and.callThrough();
        spyOn(component, 'loadGames');
        const test = spyOn(component, 'loadSelectedGame').and.returnValue(undefined);

        // expect(mockGameService).toHaveBeenCalled();

        component.selectGame(undefined);

        tick();
        expect(component.snackBar.open).toHaveBeenCalledWith(deletedError, 'Actualiser');

        const snackBarRef = component.snackBar.open(deletedError, 'Actualiser');
        expect(snackBarRef.onAction).toBeTruthy();

        snackBarRef.onAction()?.subscribe(() => {
            expect(component.loadGames).toHaveBeenCalled();
        });
    }));

    it('should select game without errors if game is visible and defined', fakeAsync(() => {
        spyOn(component.snackBar, 'open').and.callThrough();
        spyOn(component, 'loadGames');

        component.selectGame(realGame);
        tick();
        expect(component.snackBar.open).not.toHaveBeenCalledWith(deletedError, 'Actualiser');
        expect(component.snackBar.open).not.toHaveBeenCalledWith(invisibleError, 'Actualiser');
        expect(component.loadGames).not.toHaveBeenCalled();
    }));
});

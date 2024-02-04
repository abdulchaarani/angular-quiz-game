import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { GamesService } from '@app/services/games.service';
import { of } from 'rxjs';
import { GameListItemComponent } from './game-list-item.component';
import SpyObj = jasmine.SpyObj;

describe('GameListItemComponent', () => {
    let component: GameListItemComponent;
    let fixture: ComponentFixture<GameListItemComponent>;
    let gamesServiceSpy: SpyObj<GamesService>;

    beforeEach(waitForAsync(() => {
        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
        ]);

        gamesServiceSpy.toggleGameVisibility.and.returnValue(of());

        TestBed.configureTestingModule({
            imports: [MatCardModule, HttpClientModule, MatIconModule],
            declarations: [GameListItemComponent],
            providers: [{ provide: GamesService, useValue: gamesServiceSpy }],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GameListItemComponent);
        component = fixture.componentInstance;
        component.game = mockGame;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display game title and last modification', () => {
        fixture.detectChanges();
        const dom = fixture.nativeElement;
        expect(dom.textContent).toContain(mockGame.title);
        const lastModificationLabel = 'Dernière modification';
        expect(dom.textContent).toContain(lastModificationLabel);
    });

    it('should emit deleteGameFromList Event when deleteGame is called', () => {
        const spy = spyOn(component.deleteGameFromList, 'emit').and.callThrough();
        component.isAdminMode = true;
        component.deleteGame();
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(mockGame.id);
    });

    it('should display admin buttons if in admin mode', () => {
        component.isAdminMode = true;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#icons-container'))).toBeTruthy();
    });

    it('should not display edit, export, and delete buttons if not in admin mode', () => {
        component.isAdminMode = false;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#icons-container'))).toBeNull();
    });

    it('toggleGameVisibility() should call the service to toggle game visibility', () => {
        component.isAdminMode = true;
        component.toggleGameVisibility();
        expect(gamesServiceSpy.toggleGameVisibility).toHaveBeenCalledWith(component.game);
    });

    it('toggleGameVisibility() should not call the service to toggle game visibility if not in admin mode', () => {
        component.isAdminMode = false;
        component.toggleGameVisibility();
        expect(gamesServiceSpy.toggleGameVisibility).not.toHaveBeenCalled();
    });

    it('downloadGameAsJson() should call the service to download the game as json', () => {
        component.isAdminMode = true;
        component.downloadGameAsJson();
        expect(gamesServiceSpy.downloadGameAsJson).toHaveBeenCalledWith(component.game);
    });

    it('downloadGameAsJson() should not call the service to download the game as json if not in admin mode', () => {
        component.isAdminMode = false;
        component.downloadGameAsJson();
        expect(gamesServiceSpy.downloadGameAsJson).not.toHaveBeenCalled();
    });
});

const BASE_36 = 36;
const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
const mockGame = {
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
};

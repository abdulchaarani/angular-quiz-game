import { HttpClient, HttpHandler, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
import { of, throwError } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

// TODO: Add tests for JSON upload + Display Error Notifications
// Lines: 57-69
describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gamesServiceSpy: SpyObj<GamesService>;
    let notificationServiceSpy: SpyObj<NotificationService>;
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK' });

    beforeEach(waitForAsync(() => {
        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
        ]);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);

        gamesServiceSpy.getGames.and.returnValue(of(mockGames));
        gamesServiceSpy.uploadGame.and.returnValue(of(mockHttpResponse));
        gamesServiceSpy.deleteGame.and.returnValue(of(mockHttpResponse));

        TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            providers: [
                HttpClient,
                HttpHandler,
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
        expect(component.games.length).toEqual(mockGames.length);
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
        expect(component.games.length).toBe(mockGames.length - 1);
    });

    it('should open a snackbar if ondDeleteGameFromList fails', () => {
        gamesServiceSpy.deleteGame.and.returnValue(throwError(() => new Error('error')));
        component.onDeleteGameFromList('');
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should be able to add a game (with no body in the response) and display success message', () => {
        component.addGame(newMockGame);
        expect(gamesServiceSpy.uploadGame).toHaveBeenCalledWith(newMockGame);
        expect(component.games.length).toBe(mockGames.length + 1);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should be able to add a game (with appropriate body in the response) and display success message', () => {
        const mockHttpResponseWithBody: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(newMockGame) });
        gamesServiceSpy.uploadGame.and.returnValue(of(mockHttpResponseWithBody));
        component.addGame(newMockGame);
        expect(gamesServiceSpy.uploadGame).toHaveBeenCalledWith(newMockGame);
        expect(component.games.length).toBe(mockGames.length + 1);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    });

    it('should open a snackbar if addGame fails', () => {
        gamesServiceSpy.uploadGame.and.returnValue(throwError(() => new Error('error')));
        component.addGame(newMockGame);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should add game from JSON', () => {
        /*
        const event = new Event('InputEvent');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File([JSON.stringify(newMockGame)], 'file.json', { type: 'application/json' }));
        const mockEvent = {
            ...event,
            dataTransfer: dataTransfer,
            target: { ...files: dataTransfer },
        } as InputEvent;

        component.onFileSelected(mockEvent);
        expect(component.addGame).toHaveBeenCalled();
        */
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

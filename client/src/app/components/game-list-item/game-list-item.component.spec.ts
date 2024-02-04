import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { GameListItemComponent } from './game-list-item.component';

describe('GameListItemComponent', () => {
    let component: GameListItemComponent;
    let fixture: ComponentFixture<GameListItemComponent>;

    const BASE_36 = 36;
    const YEAR = 2024;
    const getRandomString = (): string => (Math.random() + 1).toString(BASE_36).substring(2);
    const getFakeGame = (): Game => ({
        id: getRandomString(),
        title: getRandomString(),
        description: getRandomString(),
        lastModification: new Date(YEAR, 1, 1).toString(),
        duration: 30,
        isVisible: true,
        questions: [
            {
                id: getRandomString(),
                type: 'QCM',
                description: getRandomString(),
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
                lastModification: new Date().toString(),
            },
        ],
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameListItemComponent],
            providers: [HttpClient, HttpHandler],
        });
        fixture = TestBed.createComponent(GameListItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminQuestionsListComponent } from './admin-questions-list.component';
import { GamesService } from '@app/services/games.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Game } from '@app/interfaces/game';
import { MatDialog } from '@angular/material/dialog';

describe('AdminQuestionsListComponent', () => {
    let component: AdminQuestionsListComponent;
    let fixture: ComponentFixture<AdminQuestionsListComponent>;
    let gamesServiceSpy: jasmine.SpyObj<GamesService>;

    const mockGame: Game = {
        id: '1',
        description: 'Test game',
        title: 'Test game',
        duration: 10,
        lastModification: '2018-11-13T20:20:39+00:00',
        questions: [
            {
                id: '1',
                type: 'QCM',
                text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
                points: 20,
                lastModification: '2018-11-13T20:20:39+00:00',
            },
            {
                id: '2',
                type: 'QCM',
                text: "Le ratio d'or est de 1:1.618, mais connaissez-vous le ratio d'argent?",
                points: 40,
                lastModification: '2024-01-20T14:17:39+00:00',
            },
        ],
    };

    beforeEach(() => {
        const route = {
            params: of({ id: '1' }),
        };
        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
            'replaceGame',
        ]);
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [AdminQuestionsListComponent],
            providers: [
                { provide: GamesService, useValue: gamesServiceSpy },
                { provide: ActivatedRoute, useValue: route },
                { provide: MatDialog, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(AdminQuestionsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.game = mockGame;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch game after initialiation', () => {
        expect(gamesServiceSpy.getGameById).toHaveBeenCalled();
    });

    // it('should be able to change title and description', () => {
    //     component.gameEditForm.setValue({ title: 'Test', description: 'Test' });
    //     component.onSubmit();
    //     expect(component.game.title).toEqual('Test');
    //     expect(component.game.description).toEqual('Test');
    // });

    it('should be able to change duration', () => {
        const event: any = { target: { value: '20' } };
        component.changeDuration(event);
        expect(component.game.duration).toEqual(20);
    });

    it('should be able to delete a question from the list', () => {
        const questionToDeleteId = component.game.questions[0]?.id;
        if (questionToDeleteId) {
            component.deleteQuestion(questionToDeleteId);
        }
        expect(component.game.questions.length).toBe(mockGame.questions.length);
    });

    it('should not be able to delete a question if there is only one question', () => {
        component.game.questions = [mockGame.questions[0]];
        const questionToDeleteId = component.game.questions[0]?.id;
        if (questionToDeleteId) {
            component.deleteQuestion(questionToDeleteId);
        }
        expect(component.game.questions.length).toBe(1);
    });

    it('should not be able to delete a question if the id is null', () => {
        component.game.questions[0].id = '';
        const questionToDeleteId = component.game.questions[0]?.id;
        component.deleteQuestion(questionToDeleteId);
        expect(component.game.questions.length).toBe(mockGame.questions.length);
    });
    
    // it('should be able to save the game', () => {
    //     component.saveGame();
    //     expect(gamesServiceSpy.replaceGame).toHaveBeenCalledWith(component.game);
    // });

});

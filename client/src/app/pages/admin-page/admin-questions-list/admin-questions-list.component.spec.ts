import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminQuestionsListComponent } from './admin-questions-list.component'; 
import { GamesService } from '@app/services/games.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AdminQuestionsListComponent', () => {
    let component: AdminQuestionsListComponent;
    let fixture: ComponentFixture<AdminQuestionsListComponent>;
    let gamesServiceSpy: jasmine.SpyObj<GamesService>;
    
    const mockGame = {
        id: '1',
        description : 'Test game',
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
            params: of({id: '1'})
        };
        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
        ]);
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            declarations: [AdminQuestionsListComponent],
            providers: [{ provide: GamesService, useValue: gamesServiceSpy },
                        { provide: ActivatedRoute, useValue: route }],
        });
        fixture = TestBed.createComponent(AdminQuestionsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch game after initialiation', () => {
        expect(gamesServiceSpy.getGameById).toHaveBeenCalled();
    });

    it('should be able to delete a question from the list', () => {
        component.game = mockGame;
        const questionToDeleteId = component.game.questions[0]?.id;
        if (questionToDeleteId) {
            component.deleteQuestion(questionToDeleteId);
        }
        expect(component.game.questions.length).toBe(1);
    });

    it('should be able to change duration', () => { 
        component.game = mockGame;
        const event: any = {target: {value: '20'}};
        component.changeDuration(event);
        expect(component.game.duration).toEqual(20);
    });

    it('should be able to add a new question', () => {
        component.game = mockGame;
        let gameLength = component.game.questions.length;
        component.addNewGame();
        expect(component.game.questions.length).toBe(gameLength + 1);
    });

});

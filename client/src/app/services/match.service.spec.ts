import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/game';
import { Observable, of } from 'rxjs';
import { ChoiceValidationService } from './choice-validation.service';
import { MatchService } from './match.service';

describe('MatchService', () => {
    let service: MatchService;
    let choiceValidationService: ChoiceValidationService;
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
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(true) });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MatchService, ChoiceValidationService],
        }).compileComponents();
        service = TestBed.inject(MatchService);
        choiceValidationService = TestBed.inject(ChoiceValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('questionAdvanced$ should return an observable', () => {
        const result = service.questionAdvanced$;
        expect(result).toBeInstanceOf(Observable);
    });

    it('should set current game and get current game correctly', () => {
        service.currentGame = fakeGame;
        const value = service.currentGame;
        expect(value).toEqual(fakeGame);
    });

    it('advanceQuestion should emit a value', () => {
        let emitted = false;
        service.questionAdvanced$.subscribe(() => {
            emitted = true;
        });
        service.advanceQuestion();

        expect(emitted).toBeTruthy();
    });

    it('should get all games with success using GetAllGames', () => {
        const spy = spyOn(service, 'getAllGames').and.returnValue(of([fakeGame]));
        service.getAllGames();
        expect(spy).toHaveBeenCalled();
    });

    it('should set and get question id correctly', () => {
        const questionId = '12345';
        service.questionId = questionId;
        const value = service.questionId;
        expect(value).toEqual(questionId);
    });

    it('should get a backup of a game with success', () => {
        const spy = spyOn(service, 'getById').and.returnValue(of(fakeGame));
        service.getBackupGame(fakeGame.id);
        expect(spy).toHaveBeenCalledOnceWith(fakeGame.id, 'backups');
    });

    it('should save a backup of a game with success', () => {
        const spy = spyOn(service, 'add').and.returnValue(of(mockHttpResponse));
        service.currentGame = fakeGame;
        service.saveBackupGame(fakeGame.id);
        expect(spy).toHaveBeenCalledOnceWith(fakeGame, `backups/${fakeGame.id}`);
    });

    it('should delete a backup of a game with success', () => {
        const spy = spyOn(service, 'delete').and.returnValue(of(mockHttpResponse));
        service.deleteBackupGame(fakeGame.id);
        expect(spy).toHaveBeenCalledOnceWith(`backups/${fakeGame.id}`);
    });

    it('should validate choices from a list of choices', () => {
        interface SelectedChoices {
            selected: string[];
        }
        const choices: SelectedChoices = { selected: [''] };
        service.currentGame = fakeGame;
        service.questionId = '0';
        const spy = spyOn(choiceValidationService, 'add').and.returnValue(of(mockHttpResponse));
        service.validateChoices(choices.selected);
        expect(spy).toHaveBeenCalledOnceWith(choices, `${fakeGame.id}/questions/${service.questionId}/validate-choice`);
    });
});

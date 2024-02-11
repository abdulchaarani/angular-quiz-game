import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, fakeAsync, waitForAsync } from '@angular/core/testing';

import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Game } from '@app/interfaces/game';
import { lastValueFrom, of } from 'rxjs';
import { ApiService } from './api.service';
import { MatchService } from './match.service';

describe('MatchService', () => {
    let service: MatchService;
    let apiServiceStub: Partial<ApiService<Game>>;
    const NOT_FOUND = 404;

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

    beforeEach(() => {
        apiServiceStub = {
            getById: jasmine.createSpy('getById').and.returnValue(of(fakeGame)),
            add: jasmine.createSpy('add').and.returnValue(of(fakeGame)),
        };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                MatchService,
                {
                    provide: ApiService,
                    useValue: apiServiceStub,
                },
            ],
        });
        service = TestBed.inject(MatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // good test?
    it('should set question id correctly with setQuestionId', () => {
        const questionId = '12345';
        const spy = spyOn(service, 'setQuestionId').and.callThrough();
        service.setQuestionId(questionId);

        expect(spy).toHaveBeenCalledWith(questionId);
        const idResult = service.getQuestionId();

        expect(idResult).toEqual(questionId);
    });

    it('should get a backup of a game with success', async () => {
        const result = await lastValueFrom(service.getBackupGame(fakeGame.id));
        expect(result).toEqual(fakeGame);
    });

    it('getBackupGame should return an error if the object is not found (404 server response)', fakeAsync(() => {
        const deletedGame = {} as Game;

        service.getBackupGame(deletedGame.id).subscribe({
            // TODO : Remove empty function
            next: () => {
                fail('Expected an error');
            },
            error: (error: HttpErrorResponse) => {
                expect(error).toBeDefined();
                expect(error.status).toEqual(NOT_FOUND);
            },
        });
    }));

    it('should save a backup of a game with success', waitForAsync(() => {
        service.saveBackupGame(fakeGame.id).subscribe({
            next: (response: HttpResponse<string>) => {
                expect(response.body).toBe(JSON.stringify(fakeGame));
            },
        });
    }));
});

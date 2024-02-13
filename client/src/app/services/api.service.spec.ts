import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { Game } from '@app/interfaces/game';
import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

describe('ApiService', () => {
    let gamesService: ApiService<Game>;
    let httpMock: HttpTestingController;

    const mockGame: Game = {
        id: 'gameID',
        title: 'gameTitle',
        description: 'gameDesc',
        lastModification: new Date().toString(),
        duration: 30,
        isVisible: true,
        questions: [
            {
                id: 'questionID',
                type: 'QCM',
                text: 'Question?',
                points: 30,
                choices: [],
                lastModification: new Date().toString(),
            },
        ],
    };

    const serverUrl: string = environment.serverUrl;
    const baseUrl = 'BASE_URL';
    const endpoint = '';
    const mockUrl = `${serverUrl}/${baseUrl}/${endpoint}`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService, { provide: 'BASE_URL', useValue: baseUrl }],
        });
        gamesService = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('A generic version of ApiService should be created', () => {
        expect(gamesService).toBeTruthy();
    });

    it('should fetch all data of type T via a GET request', () => {
        gamesService.getAll().subscribe((data) => {
            expect(data).toEqual([mockGame]);
        });

        const req = httpMock.expectOne(mockUrl);

        expect(req.request.method).toBe('GET');
        req.flush([mockGame]);
    });

    it('should fetch a single data of type T via a GET request', () => {
        const id = mockGame.id;

        gamesService.getById(id).subscribe((data) => {
            expect(data).toEqual(mockGame);
        });

        const req = httpMock.expectOne(`${mockUrl}/${id}`);

        expect(req.request.method).toBe('GET');
        req.flush(mockGame);
    });

    it('should send data of type T via a POST request', () => {
        const mockResponse = 'Resource created';
        gamesService.add(mockGame).subscribe((data) => {
            expect(data.body).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(mockUrl);

        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should delete data of type T via a DELETE request', () => {
        const mockResponse = 'Delete accepted';
        gamesService.delete(endpoint).subscribe((data) => {
            expect(data.body).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(mockUrl);

        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse);
    });

    it('should update data of type T via a PATCH request', () => {
        const mockResponse = 'Resource modified';
        gamesService.update(mockGame, endpoint).subscribe((data) => {
            expect(data.body).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(mockUrl);

        expect(req.request.method).toBe('PATCH');
        req.flush(mockResponse);
    });

    it('should replace data of type T via a PUT request', () => {
        const mockResponse = 'Resource modified';
        gamesService.replace(mockGame, endpoint).subscribe((data) => {
            expect(data.body).toEqual(mockResponse);
        });

        const req = httpMock.expectOne(mockUrl);

        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);
    });

    it('should generate an error message on error', () => {
        const mockError = new HttpErrorResponse({
            error: JSON.stringify({ message: 'Mock error message' }),
            status: 404,
            statusText: 'Not Found',
        });

        const handleErrorFn = gamesService.handleError();
        const errorObservable = handleErrorFn(mockError);

        errorObservable.subscribe({
            error: (error) => {
                expect(error.message).toContain('Mock error message');
            },
        });
    });
});

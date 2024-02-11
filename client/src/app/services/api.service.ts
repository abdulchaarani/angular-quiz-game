import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ApiService<T> {
    protected serverUrl: string = environment.serverUrl;

    protected httpOptions = {
        headers: new HttpHeaders({
            contentType: 'application/json',
        }),
        observe: 'response' as const,
        responseType: 'text' as const,
    };

    constructor(
        private readonly http: HttpClient,
        @Inject('BASE_URL') private baseUrl: string,
    ) {}

    getAll(endpoint: string = ''): Observable<T[]> {
        return this.http.get<T[]>(`${this.serverUrl}/${this.baseUrl}/${endpoint}`).pipe(catchError(this.handleError<T[]>('getAll')));
    }
    // get (avec bool all)
    getById(id: string, endpoint: string = '') {
        return this.http.get<T>(`${this.serverUrl}/${this.baseUrl}/${endpoint}/${id}`).pipe(catchError(this.handleError<T>('getById')));
    }

    add(payload: T, endpoint: string = ''): Observable<HttpResponse<string>> {
        return this.http
            .post(`${this.serverUrl}/${this.baseUrl}/${endpoint}`, payload, this.httpOptions)
            .pipe(catchError(this.handleError<HttpResponse<string>>('add')));
    }

    delete(endpoint: string): Observable<HttpResponse<string>> {
        return this.http
            .delete(`${this.serverUrl}/${this.baseUrl}/${endpoint}`, this.httpOptions)
            .pipe(catchError(this.handleError<HttpResponse<string>>('delete')));
    }

    update(endpoint: string): Observable<HttpResponse<string>> {
        return this.http
            .patch(`${this.serverUrl}/${this.baseUrl}/${endpoint}`, {}, this.httpOptions)
            .pipe(catchError(this.handleError<HttpResponse<string>>('update')));
    }

    // put
    replace(payload: T, endpoint: string): Observable<HttpResponse<string>> {
        return this.http
            .put(`${this.serverUrl}/${this.baseUrl}/${endpoint}`, payload, this.httpOptions)
            .pipe(catchError(this.handleError<HttpResponse<string>>('replace')));
    }

    handleError<E>(request: string): (error: HttpErrorResponse) => Observable<E> {
        return (error: HttpErrorResponse) => {
            return throwError(() => new Error(`Requête ${request}\n ${JSON.parse(error.error)['message']}`));
        };
    }
}

import { HttpClient } from '@angular/common/http';
// import { HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ApiService<T> {
    protected serverUrl: string = environment.serverUrl;
    constructor(
        private readonly http: HttpClient,
        @Inject(String) private baseUrl: string,
    ) {}

    getAll(endpoint: string = ''): Observable<T[]> {
        return this.http.get<T[]>(`${this.serverUrl}/${this.baseUrl}/${endpoint}`).pipe(catchError(this.handleError<T[]>('basicGet')));
    }

    // TODO: Handle Error
    private handleError<E>(request: string, result?: E): (error: Error) => Observable<E> {
        return () => of(result as E);
    }
}

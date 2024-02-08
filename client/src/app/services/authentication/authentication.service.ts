import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(private readonly http: HttpClient) {}

    validatePassword(inputUsername: string, inputPassword: string): Observable<HttpResponse<Object>> {
        const contentJsonHeader = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .post(`${environment.serverUrl}/login`, JSON.stringify({ username: inputUsername, password: inputPassword }), {
                observe: 'response',
                headers: contentJsonHeader,
            })
            .pipe(catchError((error: Error) => throwError(() => new Error('Mauvais mot de passe'))));
    }
}

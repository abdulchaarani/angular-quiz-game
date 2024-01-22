import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Question } from './interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly endpoint: string = environment.questionBankEndpoint;

    constructor(private readonly http: HttpClient) {}

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.baseUrl}/${this.endpoint}`).pipe(catchError(this.handleError<Question[]>('basicGet')));
    }

    saveQuestion(question: Question): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/${this.endpoint}`, question, { observe: 'response', responseType: 'text' });
    }

    // basicPost(message: Message): Observable<HttpResponse<string>> {
    //     return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    // }

    // TODO: Handle Error
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

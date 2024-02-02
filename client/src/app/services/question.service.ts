import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Message } from '@common/message';
import { Observable, of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Question } from '@app/interfaces/question';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private readonly baseUrl: string = environment.serverUrl;
    private readonly endpoint: string = environment.questionBankEndpoint; // causes an issue.

    constructor(private readonly http: HttpClient) {}

    private addQuestionSubject = new Subject<Question>();

    getAllQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(`${this.baseUrl}/${this.endpoint}`).pipe(catchError(this.handleError<Question[]>('basicGet')));
    }

    saveQuestion(question: Question): Observable<HttpResponse<string>> {
        this.addQuestionSubject.next(question);

        return this.http
            .post(`${this.baseUrl}/${this.endpoint}`, question, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('saveQuestion')));
    }

    onQuestionAdded(): Observable<Question> {
        return this.addQuestionSubject.asObservable();
    }

    deleteQuestion(questionId: string): Observable<HttpResponse<string>> {
        return this.http
            .delete(`${this.baseUrl}/${this.endpoint}/${questionId}`, { observe: 'response', responseType: 'text' })
            .pipe(catchError(this.handleError<HttpResponse<string>>('deleteQuestion')));
    }

    // TODO: Handle Error
    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}

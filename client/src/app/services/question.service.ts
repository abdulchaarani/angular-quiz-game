import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from '@app/interfaces/question';
import { ApiService } from './api.service';
@Injectable({
    providedIn: 'root',
})
export class QuestionService extends ApiService<Question> {
    constructor(http: HttpClient) {
        super(http, 'questions');
    }

    getAllQuestions(): Observable<Question[]> {
        return this.getAll();
    }

    createQuestion(question: Question): Observable<HttpResponse<string>> {
        return this.add(question);
    }

    // onQuestionAdded(): Observable<Question> {
    //     return this.addQuestionSubject.asObservable();
    // }

    deleteQuestion(questionId: string): Observable<HttpResponse<string>> {
        return this.delete(questionId);
    }
}

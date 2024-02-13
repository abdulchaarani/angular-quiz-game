import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from '@app/interfaces/question';
import { ApiService } from './api.service';
import { QuestionManagementState } from '@app/constants/states';
import { CreateQuestionComponent, DialogManagement } from '@app/pages/create-question/create-question.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
@Injectable({
    providedIn: 'root',
})
export class QuestionService extends ApiService<Question> {
    bankMessages = {
        unavailable: "👀 Aucune autre question valide de la banque n'est disponible! 👀",
        available: '🖐 Glissez et déposez une question de la banque dans le jeu! 🖐',
    };

    constructor(
        public dialog: MatDialog,
        http: HttpClient,
    ) {
        super(http, 'questions');
    }

    getAllQuestions(): Observable<Question[]> {
        return this.getAll();
    }

    createQuestion(question: Question): Observable<HttpResponse<string>> {
        return this.add(question);
    }

    deleteQuestion(questionId: string): Observable<HttpResponse<string>> {
        return this.delete(questionId);
    }

    verifyQuestion(question: Question) {
        return this.add(question, 'validate-question');
    }

    updateQuestion(modifiedQuestion: Question) {
        return this.update(modifiedQuestion, modifiedQuestion.id);
    }

    openCreateQuestionModal(modificationState: QuestionManagementState) {
        const manageConfig: MatDialogConfig<DialogManagement> = {
            data: {
                modificationState,
            },
            height: '70%',
            width: '100%',
        };
        return this.dialog.open(CreateQuestionComponent, manageConfig);
    }
}

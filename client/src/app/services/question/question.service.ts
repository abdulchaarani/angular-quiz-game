import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CreateQuestionComponent, DialogManagement } from '@app/components/create-question/create-question.component';
import { ManagementState } from '@app/constants/states';
import { Question } from '@app/interfaces/question';
import { Observable } from 'rxjs';
import { CommunicationService } from '../communication/communication.service';
@Injectable({
    providedIn: 'root',
})
export class QuestionService extends CommunicationService<Question> {
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

    openCreateQuestionModal(modificationState: ManagementState) {
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

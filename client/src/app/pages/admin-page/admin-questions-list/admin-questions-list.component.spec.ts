import { HttpClientModule, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { SortByLastModificationPipe } from '@app/pipes/sort-by-last-modification.pipe';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
import { QuestionService } from '@app/services/question.service';
import { of, throwError } from 'rxjs';
import { AdminQuestionsListComponent } from './admin-questions-list.component';

describe('AdminQuestionsListComponent', () => {
    let component: AdminQuestionsListComponent;
    let fixture: ComponentFixture<AdminQuestionsListComponent>;
    let gamesServiceSpy: jasmine.SpyObj<GamesService>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK' });
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let routerSpy: jasmine.SpyObj<Router>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    const mockGame: Game = {
        id: '1',
        description: 'Test game',
        title: 'Test game',
        duration: 10,
        lastModification: '2018-11-13T20:20:39+00:00',
        questions: [
            {
                id: '1',
                type: 'QCM',
                text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
                points: 20,
                lastModification: '2018-11-13T20:20:39+00:00',
            },
            {
                id: '2',
                type: 'QCM',
                text: "Le ratio d'or est de 1:1.618, mais connaissez-vous le ratio d'argent?",
                points: 40,
                lastModification: '2024-01-20T14:17:39+00:00',
            },
        ],
    };

    const mockQuestions: Question[] = [
        {
            id: '1',
            type: 'QCM',
            text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
            points: 20,
            lastModification: '2018-11-13T20:20:39+00:00',
        },
        {
            id: '2',
            type: 'QCM',
            text: "Le ratio d'or est de 1:1.618, mais connaissez-vous le ratio d'argent?",
            points: 40,
            lastModification: '2024-01-20T14:17:39+00:00',
        },
    ];

    // const mockNewQuestion: Question = { id: '1', text: 'Test Question 1', type: 'QCM', points: 10, lastModification: '' };

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['params', 'data', 'navigate']);

        const params = of({ id: '1' });
        const data = of({ game: mockGame });

        activatedRouteSpy.params = params;
        activatedRouteSpy.data = data;

        gamesServiceSpy = jasmine.createSpyObj('GamesService', [
            'getGames',
            'getGameById',
            'toggleGameVisibility',
            'deleteGame',
            'uploadGame',
            'downloadGameAsJson',
            'replaceGame',
            'submitGame',
            'markPendingChanges',
            'displaySuccessMessage',
            'displayErrorMessage',
            'resetPendingChanges',
        ]);
        // matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getAllQuestions', 'createQuestion']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);
        questionServiceSpy.createQuestion.and.returnValue(of(mockHttpResponse));
        gamesServiceSpy.isPendingChangesObservable = of(false);
        gamesServiceSpy.questionService = questionServiceSpy;

        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatDialogModule, RouterTestingModule],
            declarations: [AdminQuestionsListComponent, SortByLastModificationPipe],
            providers: [
                { provide: GamesService, useValue: gamesServiceSpy },
                { provide: MatDialog, useValue: matDialogSpy },
                { provide: MatSnackBar, useValue: {} },
                { provide: NotificationService, useValue: notificationServiceSpy },
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: ActivatedRoute, useValue: activatedRouteSpy },
            ],
        }).compileComponents();

        matDialogSpy = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        fixture = TestBed.createComponent(AdminQuestionsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.game = mockGame;
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockQuestions));
        gamesServiceSpy.submitGame.and.returnValue(of(mockHttpResponse));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the game', () => {
        expect(component.game).toEqual(mockGame);
    });

    it('should be able to change duration', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event: any = { target: { value: '20' } };
        component.changeDuration(event);
        expect(component.game.duration).toEqual(20);
    });

    it('should handle submit', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.state = 'modify';
        component.handleSubmit();

        expect(gamesServiceSpy.submitGame).toHaveBeenCalled();
        expect(gamesServiceSpy.displaySuccessMessage).toHaveBeenCalledWith('Jeux modifié avec succès! 😺');
        expect(gamesServiceSpy.resetPendingChanges).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/games/']);
    });

    it('should handle submit error', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.state = 'modify';
        const errorMessage = 'Error submitting game';
        gamesServiceSpy.submitGame.and.returnValue(throwError(new HttpErrorResponse({ error: errorMessage })));
        component.handleSubmit();
        expect(gamesServiceSpy.submitGame).toHaveBeenCalled();
        expect(gamesServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    // it('should add a new question to the current game', () => {
    //     component.addNewQuestion(mockNewQuestion);
    //     expect(component.game.questions).toContain(mockNewQuestion);
    //     expect(component.game.questions.length).toBe(mockGame.questions.length);
    // });

    // it('should be able to delete a question from the list', () => {
    //     const questionToDeleteId = component.game.questions[0]?.id;
    //     if (questionToDeleteId) {
    //         component.deleteQuestion(questionToDeleteId);
    //     }
    //     expect(component.game.questions.length).toBe(mockGame.questions.length);
    // });

    // it('should be able to change title and description', () => {
    //     component.gameEditForm.setValue({ title: 'Test', description: 'Test' });
    //     component.onSubmit();
    //     expect(component.game.title).toEqual('Test');
    //     expect(component.game.description).toEqual('Test');
    // });

    // it('should not be able to delete a question if there is only one question', () => {
    //     component.game.questions = [mockGame.questions[0]];
    //     const questionToDeleteId = component.game.questions[0]?.id;
    //     if (questionToDeleteId) {
    //         component.deleteQuestion(questionToDeleteId);
    //     }
    //     expect(component.game.questions.length).toBe(1);
    // });

    // it('should not be able to delete a question if the id is null', () => {
    //     component.game.questions[0].id = '';
    //     const questionToDeleteId = component.game.questions[0]?.id;
    //     component.deleteQuestion(questionToDeleteId);
    //     expect(component.game.questions.length).toBe(mockGame.questions.length);
    // });

    // it('should not add an existing question to the game', () => {
    //     component.addNewQuestion(mockNewQuestion);
    //     expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    // });

    // it('should toggle create question dialog', () => {
    //     expect(component.dialogState).toBeFalse();
    //     component.toggleCreateQuestion();
    //     expect(component.dialogState).toBeTrue();
    // });

    // it('should add a question to the bank o questions', () => {
    //     component.addQuestionToBank(mockNewQuestion);
    //     expect(component.originalBankQuestions).toContain(mockNewQuestion);
    //     expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalled();
    // });

    // it('should not add question to bank if duplicate', () => {
    //     component.addQuestionToBank(mockNewQuestion);
    //     expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    // });

    // it('should be able to save the game', () => {
    //     component.saveGame();
    //     expect(gamesServiceSpy.replaceGame).toHaveBeenCalledWith(component.game);
    // });
});

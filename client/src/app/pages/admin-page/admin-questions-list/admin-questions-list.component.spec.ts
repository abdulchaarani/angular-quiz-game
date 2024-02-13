/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
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
import { Subject, of, throwError } from 'rxjs';
import { AdminQuestionsListComponent } from './admin-questions-list.component';
import { BankStatus, GameStatus, QuestionStatus } from '@app/constants/feedback-messages';
import { CdkDragDrop, CdkDragEnd } from '@angular/cdk/drag-drop';

describe('AdminQuestionsListComponent', () => {
    let component: AdminQuestionsListComponent;
    let fixture: ComponentFixture<AdminQuestionsListComponent>;

    let gamesServiceSpy: jasmine.SpyObj<GamesService>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    let routerSpy: jasmine.SpyObj<Router>;
    let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;

    const mockQuestions: Question[] = [
        {
            id: '1',
            type: 'QCM',
            text: 'Combien de motifs blancs et noirs y a-t-il respectivement sur un ballon de soccer?',
            points: 20,
            lastModification: '2018-11-13T20:20:39+00:00',
        },
    ];

    const mockBankQuestions: Question[] = [
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

    const mockGame: Game = {
        id: '1',
        description: 'Test game',
        title: 'Test game',
        duration: 10,
        lastModification: '2018-11-13T20:20:39+00:00',
        questions: mockQuestions,
    };

    const mockNewQuestion = { id: '3', text: 'Question 3', type: 'QCM', points: 10, lastModification: '' };

    const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(mockNewQuestion) });

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
            'isPendingChangesObservable',
        ]);

        questionServiceSpy = jasmine.createSpyObj('QuestionService', [
            'getAllQuestions',
            'createQuestion',
            'verifyQuestion',
            'openCreateQuestionModal',
        ]);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
            'openPendingChangesConfirmDialog',
            'displayErrorMessage',
            'displaySuccessMessage',
            'confirmBankUpload',
        ]);
        questionServiceSpy.createQuestion.and.returnValue(of(mockHttpResponse));
        gamesServiceSpy.isPendingChangesObservable = of(false);

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

        fixture = TestBed.createComponent(AdminQuestionsListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.game = JSON.parse(JSON.stringify(mockGame));
        component.originalBankQuestions = JSON.parse(JSON.stringify(mockBankQuestions));
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockBankQuestions));
        gamesServiceSpy.submitGame.and.returnValue(of(mockHttpResponse));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set the game', () => {
        expect(component.game).toEqual(mockGame);
    });

    it('should be able to change duration', () => {
        const event: Event = { target: { value: '20' } } as unknown as Event;
        component.changeDuration(event);
        expect(component.game.duration).toEqual(20);
    });

    it('should handle submit', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.state = 'modify';
        component.handleSubmit();

        expect(gamesServiceSpy.submitGame).toHaveBeenCalled();
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalledWith('Jeux modifié avec succès! 😺');
        expect(gamesServiceSpy.resetPendingChanges).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/games/']);
    });

    it('should handle modify submit error', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.state = 'modify';
        const errorMessage = 'Error submitting game';
        gamesServiceSpy.submitGame.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));
        component.handleSubmit();
        expect(gamesServiceSpy.submitGame).toHaveBeenCalled();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should handle create submit error', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.state = 'create';
        const errorMessage = 'Error submitting game';
        gamesServiceSpy.submitGame.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorMessage })));
        component.handleSubmit();
        expect(gamesServiceSpy.submitGame).toHaveBeenCalled();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should return true when there are no pending changes', () => {
        component.isPendingChanges = false;
        const result = component.canDeactivate();
        expect(result).toBeTrue();
    });

    it('should return a subject when there are pending changes', () => {
        component.isPendingChanges = true;
        const confirmSubject = new Subject<boolean>();
        notificationServiceSpy.openPendingChangesConfirmDialog.and.returnValue(confirmSubject);
        const result = component.canDeactivate();
        expect(result instanceof Subject).toBeTrue();
    });

    it('should call openPendingChangesConfirmDialog when there are pending changes', () => {
        component.isPendingChanges = true;
        const confirmSubject = new Subject<boolean>();
        notificationServiceSpy.openPendingChangesConfirmDialog.and.returnValue(confirmSubject);
        component.canDeactivate();
        expect(notificationServiceSpy.openPendingChangesConfirmDialog).toHaveBeenCalled();
    });

    it('should set game and form values correctly', () => {
        gamesServiceSpy.getGameById.and.returnValue(of(mockGame));
        questionServiceSpy.getAllQuestions.and.returnValue(of(mockBankQuestions));
        component.setGame().subscribe(() => {
            expect(component.game).toEqual(mockGame);
            expect(component.gameForm.value).toEqual({
                title: mockGame.title,
                description: mockGame.description,
                duration: mockGame.duration.toString(),
            });
        });
    });

    it('should filter the bank questions when state is "modify"', () => {
        component.state = 'modify';
        spyOn(component, 'setGame').and.returnValue(of(mockQuestions));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'filterBankQuestions').and.returnValue(mockQuestions);
        component.ngAfterViewInit();

        expect(component.setGame).toHaveBeenCalled();
        expect(component['filterBankQuestions']).toHaveBeenCalledWith(mockQuestions, mockGame.questions);
        expect(component.originalBankQuestions).toEqual(mockQuestions);
        expect(component.bankQuestions).toEqual(mockQuestions);
        expect(gamesServiceSpy.resetPendingChanges).toHaveBeenCalled();
    });

    it('should get all questions from bank when state is "create"', () => {
        component.state = 'create';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'filterBankQuestions').and.returnValue(mockBankQuestions);

        component.ngAfterViewInit();

        expect(component['questionService'].getAllQuestions).toHaveBeenCalled();
        expect(component.originalBankQuestions).toEqual(mockBankQuestions);
        expect(component.bankQuestions).toEqual(mockBankQuestions);
        expect(gamesServiceSpy.resetPendingChanges).toHaveBeenCalled();
    });

    it('should handle error on fetch questions error', () => {
        component.state = 'modify';
        const errorMessage = 'Error message';
        spyOn(component, 'setGame').and.returnValue(throwError(() => new Error(errorMessage)));

        component.ngAfterViewInit();

        expect(component.setGame).toHaveBeenCalled();
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalledWith(`${GameStatus.FAILURE}\n${errorMessage}`);
    });

    it('should filter questions correctly', () => {
        const filteredQuestions = component['filterBankQuestions'](mockBankQuestions, mockQuestions);
        expect(filteredQuestions.length).toEqual(1);
        expect(filteredQuestions).toEqual([mockBankQuestions[1]]);
    });

    it('should return true if new question has a duplicate in the bank', () => {
        const isDuplicate = component['isDuplicateQuestion'](mockQuestions[0], mockBankQuestions);
        expect(isDuplicate).toBeTrue();
    });

    it('should return false if new question doesn not have a duplicate in the bank', () => {
        const isDuplicate = component['isDuplicateQuestion'](mockNewQuestion, mockBankQuestions);
        expect(isDuplicate).toBeFalse();
    });

    it('should set bank message to UNAVAILABLE when bankQuestions is empty', () => {
        component.bankQuestions = [];
        component['setBankMessage']();
        expect(component.currentBankMessage).toEqual(BankStatus.UNAVAILABLE);
    });

    it('should set bank message to AVAILABLE when bankQuestions is not empty', () => {
        component.bankQuestions = mockBankQuestions;
        component['setBankMessage']();
        expect(component.currentBankMessage).toEqual(BankStatus.AVAILABLE);
    });

    it('should add verified question to game and mark pending changes', () => {
        questionServiceSpy.verifyQuestion.and.returnValue(of(mockHttpResponse));
        component.addQuestionToGame(mockNewQuestion);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalledWith(QuestionStatus.VERIFIED);
        expect(component.game.questions).toContain(mockNewQuestion);
        expect(component['gamesService'].markPendingChanges).toHaveBeenCalled();
    });

    it('should display error message when verification fails', () => {
        const errorMessage = 'Question should contain at least 1 wrong and 1 right answer';
        questionServiceSpy.verifyQuestion.and.returnValue(throwError(() => new Error(errorMessage)));
        component.addQuestionToGame(mockNewQuestion);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalledWith(`${QuestionStatus.UNVERIFIED} \n ${errorMessage}`);
    });

    it('should add question to bank and display success message', () => {
        component.currentQuestion = mockNewQuestion;
        component.originalBankQuestions = [];
        questionServiceSpy.createQuestion.and.returnValue(of(mockHttpResponse)); // Mock successful creation
        component.addQuestionToBank(mockNewQuestion);
        expect(notificationServiceSpy.displaySuccessMessage).toHaveBeenCalledWith(BankStatus.SUCCESS);
        expect(component.originalBankQuestions.length).toBe(1);
        expect(component.originalBankQuestions[0]).toEqual(mockNewQuestion);
    });

    it('should display duplicate error message when question is a duplicate', () => {
        component.currentQuestion = mockNewQuestion;
        component.originalBankQuestions = [mockNewQuestion];
        component.addQuestionToBank(mockNewQuestion);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalledWith(BankStatus.DUPLICATE);
        expect(questionServiceSpy.createQuestion).not.toHaveBeenCalled();
    });

    it('should display error message when question creation fails', () => {
        component.currentQuestion = mockNewQuestion;
        component.originalBankQuestions = [];
        const errorMessage = 'Error creating question';
        questionServiceSpy.createQuestion.and.returnValue(throwError(() => new Error(errorMessage)));
        component.addQuestionToBank(mockNewQuestion);
        expect(notificationServiceSpy.displayErrorMessage).toHaveBeenCalledWith(`${BankStatus.FAILURE}\n ${errorMessage}`);
        expect(component.originalBankQuestions.length).toBe(0);
    });

    it('should be able to delete a question from the list and update bank question list', () => {
        component.game.questions = Object.assign([], mockBankQuestions);
        component.deleteQuestion('1');
        expect(component.game.questions.length).toBe(1);
        expect(component.bankQuestions.length).toBe(1);
    });

    it('should be able to change title and description', () => {
        component.gameForm.setValue({ title: 'Test', description: 'Test', duration: '10' });
        component.handleSubmit();
        expect(component.game.title).toEqual('Test');
        expect(component.game.description).toEqual('Test');
    });

    it('should not be able to delete a question if there is only one question', () => {
        component.game.questions = [mockGame.questions[0]];
        const questionToDeleteId = component.game.questions[0]?.id;
        if (questionToDeleteId) {
            component.deleteQuestion(questionToDeleteId);
        }
        expect(component.game.questions.length).toBe(1);
    });

    it('should not be able to delete a question if the id is null', () => {
        component.game.questions[0].id = '';
        const questionToDeleteId = component.game.questions[0]?.id;
        component.deleteQuestion(questionToDeleteId);
        expect(component.game.questions.length).toBe(mockGame.questions.length);
    });

    it('should toggle create question dialog state', () => {
        expect(component.dialogState).toBeFalse();
        component.toggleCreateQuestion();
        expect(component.dialogState).toBeTrue();
    });

    it('should toggle side bar active state', () => {
        component.isSideBarActive = false;
        expect(component.isSideBarActive).toBeFalse();
        component.toggleSideBarClass();
        expect(component.isSideBarActive).toBeTrue();
    });

    it('should not open create question dialog if dialog state is true', () => {
        component.dialogState = true;
        component.openCreateQuestionDialog();
        expect(questionServiceSpy.openCreateQuestionModal).not.toHaveBeenCalled();
    });

    it('should set currentQuestion on dragQuizQuestion', () => {
        const mockQuestion: Question = { id: '1', text: 'Test question', type: 'QCM', points: 10, lastModification: '' };
        component.dragQuizQuestion(mockQuestion);
        expect(component.currentQuestion).toEqual(mockQuestion);
    });

    it('should call openConfirmDialog on dropQuizQuestion if container is present', () => {
        const mockEvent = { event: { target: { closest: () => true } } } as unknown as CdkDragEnd<Question[]>;
        spyOn(component, 'openConfirmDialog');
        component.dropQuizQuestion(mockEvent);
        expect(component.openConfirmDialog).toHaveBeenCalled();
    });

    it('should not call openConfirmDialog on dropQuizQuestion if container is not present', () => {
        const mockEvent = {
            event: { target: { closest: () => false } },
        } as unknown as CdkDragEnd<Question[]>;

        spyOn(component, 'openConfirmDialog');
        component.dropQuizQuestion(mockEvent);
        expect(component.openConfirmDialog).not.toHaveBeenCalled();
    });

    it('should set isBankQuestionDragged to true on dragBankQuestion', () => {
        component.dragBankQuestion();
        expect(component.isBankQuestionDragged).toBeTrue();
    });

    it('should set isBankQuestionDragged to false on dropBankQuestion', () => {
        component.dropBankQuestion();
        expect(component.isBankQuestionDragged).toBeFalse();
    });

    // it('should move question within the quiz list and mark changes', () => {
    //     const mockListQuestions: Question[] = [
    //         { id: '1', text: 'Question 1', type: 'QCM', points: 10, lastModification: '' },
    //         { id: '2', text: 'Question 2', type: 'QCM', points: 20, lastModification: '' },
    //         { id: '3', text: 'Question 3', type: 'QCM', points: 30, lastModification: '' },
    //     ];
    //     component.game.questions = [...mockListQuestions];

    //     const mockDragDropEvent = {
    //         previousContainer: { data: component.game.questions },
    //         container: { data: component.game.questions },
    //         previousIndex: 0,
    //         currentIndex: 1,
    //     } as unknown as CdkDragDrop<Question[]>;
    //     fixture.detectChanges();
    //     component.dropInQuizList(mockDragDropEvent);
    //     expect(component.game.questions[0]).toEqual(mockListQuestions[1]);
    //     expect(component.game.questions[1]).toEqual(mockListQuestions[0]);
    // });

    it('should transfer question to another list if not duplicate and mark changes', () => {
        const mockDragDropEvent = {
            previousContainer: { data: [...mockBankQuestions] },
            container: { data: component.game.questions },
            previousIndex: 0,
            currentIndex: 0,
        } as unknown as CdkDragDrop<Question[]>;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'isDuplicateQuestion').and.returnValue(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(component, 'setBankMessage');

        component.dropInQuizList(mockDragDropEvent);

        expect(component['setBankMessage']).toHaveBeenCalled();
        expect(component['gamesService'].markPendingChanges).toHaveBeenCalled();
    });

    it('should display error message if dropping duplicate question in quiz list', () => {
        const mockDragDropEvent = {
            previousContainer: { data: [...mockBankQuestions] },
            container: { data: [...mockQuestions] },
            previousIndex: 0,
            currentIndex: 0,
        } as unknown as CdkDragDrop<Question[]>;

        component.dropInQuizList(mockDragDropEvent);
        expect(component['notificationService'].displayErrorMessage).toHaveBeenCalled();
    });

    it('should prompt user to confirm adding question to bank', async () => {
        const mockConfirmation = true;
        component.currentQuestion = mockBankQuestions[0];
        notificationServiceSpy.confirmBankUpload.and.returnValue(of(mockConfirmation));
        await component.openConfirmDialog();
        expect(notificationServiceSpy.confirmBankUpload).toHaveBeenCalled();
    });

    it('should not add question to bank if user cancels on confirmation dialog', async () => {
        const mockConfirmation = false;
        component.currentQuestion = mockBankQuestions[0];
        notificationServiceSpy.confirmBankUpload.and.returnValue(of(mockConfirmation));
        await component.openConfirmDialog();
        expect(notificationServiceSpy.confirmBankUpload).toHaveBeenCalled();
        expect(questionServiceSpy.createQuestion).not.toHaveBeenCalled();
    });
});

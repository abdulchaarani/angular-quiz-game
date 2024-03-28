/* eslint-disable @typescript-eslint/no-magic-numbers */
// To let the tests run smoothly
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, SimpleChanges } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { MatchStatus, WarningMessage } from '@app/constants/feedback-messages';
import { getMockQuestion } from '@app/constants/question-mocks';
import { MatchContext } from '@app/constants/states';
import { Choice } from '@app/interfaces/choice';
import { Player } from '@app/interfaces/player';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Feedback } from '@common/interfaces/feedback';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';
import { QuestionAreaComponent } from './question-area.component';
import spyObj = jasmine.SpyObj;

class SocketHandlerServiceMock extends SocketHandlerService {
    override connect() {}
}

@Component({
    selector: 'app-chat',
    template: '',
})
class MockChatComponent {}

describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;
    let matchSpy: spyObj<MatchService>;
    let router: spyObj<Router>;
    let socketSpy: SocketHandlerServiceMock;
    let socketHelper: SocketTestHelper;
    let matchRoomSpy: spyObj<MatchRoomService>;
    let questionContextSpy: spyObj<QuestionContextService>;
    let notificationServiceSpy: spyObj<NotificationService>;
    let answerSpy: spyObj<AnswerService>;
    let booleanSubject: BehaviorSubject<boolean>;
    let bonusSubject: Subject<number>;
    let questionSubject: Subject<Question>;
    let feedbackSubject: Subject<Feedback>;
    let mockHistoryState: { question: Question; duration: number };

    beforeEach(async () => {
        mockHistoryState = {
            question: {
                id: '1',
                type: 'multiple-choice',
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'London', isCorrect: false },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'Paris', isCorrect: true },
                    { text: 'Madrid', isCorrect: false },
                ],
                lastModification: '2021-07-01T00:00:00.000Z',
            },
            duration: 60,
        };
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        answerSpy = jasmine.createSpyObj('AnswerService', [
            'selectChoice',
            'deselectChoice',
            'submitAnswer',
            'onFeedback',
            'onBonusPoints',
            'onEndGame',
        ]);
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', [
            'nextQuestion',
            'getUsername',
            'getRoomCode',
            'disconnect',
            'sendPlayersData',
            'onRouteToResultsPage',
            'routeToResultsPage',
            'onGameOver',
            'disconnect',
        ]);
        socketHelper = new SocketTestHelper();
        socketSpy = new SocketHandlerServiceMock(router);
        socketSpy.socket = socketHelper as unknown as Socket;
        matchSpy = jasmine.createSpyObj('MatchService', [
            'getAllGames',
            'advanceQuestion',
            'getBackupGame',
            'saveBackupGame',
            'deleteBackupGame',
            'createMatch',
            'validateChoices',
        ]);
        questionContextSpy = jasmine.createSpyObj('QuestionContextService', ['getContext']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['openWarningDialog']);
        await TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent, MockChatComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule],
            providers: [
                HttpClient,
                { provide: MatchService, useValue: matchSpy },
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: AnswerService, useValue: answerSpy },
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: QuestionContextService, useValue: questionContextSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;

        history.pushState(mockHistoryState, '');

        booleanSubject = new BehaviorSubject<boolean>(false);
        bonusSubject = new Subject<number>();
        questionSubject = new Subject<Question>();
        feedbackSubject = new Subject<Feedback>();
        matchRoomSpy.displayCooldown$ = booleanSubject.asObservable();
        matchRoomSpy.currentQuestion$ = questionSubject.asObservable();
        matchRoomSpy.isHostPlaying$ = booleanSubject.asObservable();
        answerSpy.endGame$ = booleanSubject.asObservable();
        answerSpy.bonusPoints$ = bonusSubject.asObservable();
        answerSpy.feedback$ = feedbackSubject.asObservable();
        answerSpy.isFeedback$ = booleanSubject.asObservable();

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should deactivate page when player or host is quitting', () => {
        component.isQuitting = true;
        const isDeactivated = component.canDeactivate();
        expect(isDeactivated).toBe(true);
    });

    it('should deactivate page host quit', () => {
        component.isHostPlaying = false;
        const isDeactivated = component.canDeactivate();
        expect(isDeactivated).toBe(true);
    });

    it('should deactivate page on results page', () => {
        component.isQuitting = false;
        component.isHostPlaying = true;
        matchRoomSpy.isResults = true;
        const isDeactivated = component.canDeactivate();
        expect(isDeactivated).toBe(true);
    });

    it('should deactivate page if on test page', () => {
        component.isQuitting = false;
        component.isHostPlaying = true;
        matchRoomSpy.isResults = false;

        questionContextSpy.getContext.and.returnValue(MatchContext.TestPage);
        const quitGameSpy = spyOn(component, 'quitGame').and.callFake(() => {});
        const isDeactivated = component.canDeactivate();
        expect(quitGameSpy).toHaveBeenCalled();
        expect(isDeactivated).toBe(true);
    });

    it('should prompt user if back button is pressed and only deactivate if user confirms', () => {
        component.isQuitting = false;
        component.isHostPlaying = true;
        matchRoomSpy.isResults = false;
        questionContextSpy.getContext.and.returnValue(MatchContext.PlayerView);
        const deactivateSubject = new Subject<boolean>();
        notificationServiceSpy.openWarningDialog.and.returnValue(deactivateSubject);
        const result = component.canDeactivate();
        expect(result instanceof Subject).toBeTrue();
        expect(notificationServiceSpy.openWarningDialog).toHaveBeenCalledWith(WarningMessage.QUIT);
        expect(matchRoomSpy.disconnect).not.toHaveBeenCalled();
        deactivateSubject.next(true);
        expect(matchRoomSpy.disconnect).toHaveBeenCalled();
    });

    it('should unsubscribe from subscriptions on ngOnDestroy', () => {
        const unsubscribeSpy = jasmine.createSpyObj('unsubscribe', ['unsubscribe']);
        const subscriptions = [unsubscribeSpy, unsubscribeSpy, unsubscribeSpy];
        component['eventSubscriptions'] = subscriptions;

        component.ngOnDestroy();

        expect(unsubscribeSpy.unsubscribe).toHaveBeenCalledTimes(subscriptions.length);
    });

    it('should handle enter event', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(component, 'submitAnswers');
        component.handleKeyboardEvent(event);
        expect(component.submitAnswers).toHaveBeenCalled();
    });

    it('should not submit answer if chat input is active and enter is pressed', () => {
        const chatInput = document.createElement('input');
        chatInput.id = 'chat-input';
        Object.defineProperty(document, 'activeElement', { value: chatInput, writable: true });
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(component, 'submitAnswers');
        component.handleKeyboardEvent(event);
        expect(component.submitAnswers).not.toHaveBeenCalled();
        Object.defineProperty(document, 'activeElement', { value: component, writable: true });
    });

    it('should select a choice when a number key is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        const choice: Choice = { text: 'London', isCorrect: false };
        component.answers = [choice];
        spyOn(component, 'selectChoice');
        component.handleKeyboardEvent(event);
        expect(component.selectChoice).toHaveBeenCalledWith(choice);
    });

    it('should not select a choice when an invalid key is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        const choice: Choice = { text: 'London', isCorrect: false };
        component.answers = [choice];
        spyOn(component, 'selectChoice');
        component.handleKeyboardEvent(event);
        expect(component.selectChoice).not.toHaveBeenCalledWith(choice);
    });

    it('should not select a choice when there are not choices', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.currentQuestion.choices = [];
        spyOn(component, 'selectChoice');
        component.handleKeyboardEvent(event);
        expect(component.selectChoice).not.toHaveBeenCalled();
    });

    it('should get players', () => {
        matchRoomSpy.players = [
            {
                username: 'test',
                score: 0,
                bonusCount: 0,
                isPlaying: true,
            } as Player,
        ];
        const players = component.players;
        expect(players).toBeDefined();
    });

    it('should update currentQuestion and answers when ngOnChanges is called with changes to currentQuestion', () => {
        const newQuestion: Question = {
            id: '2',
            type: 'multiple-choice',
            text: 'What is the capital of Germany?',
            points: 10,
            choices: [
                { text: 'London', isCorrect: false },
                { text: 'Berlin', isCorrect: true },
                { text: 'Paris', isCorrect: false },
                { text: 'Madrid', isCorrect: false },
            ],
            lastModification: '2021-07-02T00:00:00.000Z',
        };
        const changes: SimpleChanges = {
            currentQuestion: {
                currentValue: newQuestion,
                previousValue: null,
                firstChange: true,
                isFirstChange: () => true,
            },
        };

        spyOn(component, 'resetStateForNewQuestion');

        component.ngOnChanges(changes);

        expect(component.currentQuestion).toEqual(newQuestion);
        expect(component.answers).toBeDefined();
        expect(matchSpy.questionId).toBe(newQuestion.id);
        expect(component.resetStateForNewQuestion).toHaveBeenCalled();
    });

    it('should submit answers when submitAnswers is called', () => {
        component.submitAnswers();
        expect(answerSpy.submitAnswer).toHaveBeenCalled();
    });

    it('should go to next question when nextQuestion is called', () => {
        component.nextQuestion();
        expect(matchRoomSpy.nextQuestion).toHaveBeenCalled();
    });

    it('should add the choice to selectedAnswers if it is not already included', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [];

        component.selectChoice(choice);

        expect(component.selectedAnswers).toContain(choice);
    });

    it('should remove the choice from selectedAnswers if it is already included', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [choice];

        component.selectChoice(choice);

        expect(component.selectedAnswers).not.toContain(choice);
    });

    it('should not add or remove the choice if isSelectionEnabled is false', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = false;
        component.selectedAnswers = [];

        component.selectChoice(choice);

        expect(component.selectedAnswers).toEqual([]);
    });

    it('getHistoryState() should return the current history state', () => {
        const result = component.getHistoryState();
        expect(result).toEqual(mockHistoryState);
    });

    it('quitGame() should set isQuitting to true and delegate deconnection to matchService', () => {
        component.isQuitting = false;
        component.quitGame();
        expect(component.isQuitting).toBe(true);
        expect(matchRoomSpy.disconnect).toHaveBeenCalled();
    });

    it('should call answerService.selectChoice if context is not hostView and choice is added', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [];
        component.context = MatchContext.TestPage;

        component.selectChoice(choice);

        expect(answerSpy.selectChoice).toHaveBeenCalledWith(choice.text, { username: component.username, roomCode: component.matchRoomCode });
    });

    it('should call answerService.deselectChoice if context is not hostView and choice is removed', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [choice];
        component.context = MatchContext.TestPage;

        component.selectChoice(choice);

        expect(answerSpy.deselectChoice).toHaveBeenCalledWith(choice.text, { username: component.username, roomCode: component.matchRoomCode });
    });

    it('should return true if the choice is included in selectedAnswers', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.selectedAnswers = [choice];

        expect(component.isSelected(choice)).toBeTrue();
    });

    it('should return false if the choice is not included in selectedAnswers', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.selectedAnswers = [];

        expect(component.isSelected(choice)).toBeFalse();
    });

    it('should return true if the choice is included in correctAnswers', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.correctAnswers = [choice.text];

        expect(component.isCorrectAnswer(choice)).toBeTrue();
    });

    it('should return false if the choice is not included in correctAnswers', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.correctAnswers = [];

        expect(component.isCorrectAnswer(choice)).toBeFalse();
    });

    it('should reset the state for a new question when resetStateForNewQuestion is called', () => {
        component.showFeedback = true;
        component.isSelectionEnabled = false;
        component.selectedAnswers = [{ text: 'London', isCorrect: false }];
        component.bonus = 5;
        component.correctAnswers = ['Paris'];
        component.isRightAnswer = true;
        component.isCooldown = true;

        component.resetStateForNewQuestion();

        expect(component.showFeedback).toBeFalse();
        expect(component.isSelectionEnabled).toBeTrue();
        expect(component.selectedAnswers).toEqual([]);

        expect(component.bonus).toBe(0);
        expect(component.correctAnswers).toEqual([]);
        expect(component.isRightAnswer).toBeFalse();
        expect(component.isCooldown).toBeFalse();
    });

    it('should call matchRoomService.routeToResultsPage when routeToResultsPage is called', () => {
        component.routeToResultsPage();

        expect(matchRoomSpy.onRouteToResultsPage).toHaveBeenCalled();
    });

    it('should call handleFeedback when feedback is received', () => {
        const feedback = {
            correctAnswer: ['Paris'],
            score: 20,
        };

        component.playerScore = 10;
        component.context = MatchContext.TestPage;

        spyOn(component, 'nextQuestion');

        component['handleFeedback'](feedback);

        expect(component.isSelectionEnabled).toBeFalse();
        expect(component.correctAnswers).toEqual(feedback.correctAnswer);
        expect(component.isRightAnswer).toBeTrue();
        expect(component.playerScore).toBe(feedback.score);
        expect(matchRoomSpy.sendPlayersData).toHaveBeenCalledWith(component.matchRoomCode);
        expect(component.showFeedback).toBeTrue();
        expect(component.nextQuestion).toHaveBeenCalled();
    });

    it('should handle question change', () => {
        const question = getMockQuestion();
        spyOn(component, 'ngOnChanges');
        component['handleQuestionChange'](question);

        expect(component.currentQuestion).toEqual(question);
        expect(component.ngOnChanges).toHaveBeenCalled();
    });

    it('subscribeToFeedback() should add a subscription to feedback and delegate feedbacnk change to handleFeedback() ', () => {
        component.showFeedback = false;
        component.isNextQuestionButton = false;

        const handleFeedbackSpy = spyOn<any>(component, 'handleFeedback').and.returnValue(true);
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToFeedback']();

        expect(subscriptions.length).toEqual(2);

        const feedback = {} as Feedback;
        feedbackSubject.next(feedback);
        booleanSubject.next(true);

        expect(handleFeedbackSpy).toHaveBeenCalledWith(feedback);
        expect(component.showFeedback).toBe(true);
        expect(component.isNextQuestionButton).toBe(true);
    });

    it('subscribeToCurrentQuestion() should add a subscription to current question and delegate question change to handleQuestionChange() ', () => {
        const handleQuestionSpy = spyOn<any>(component, 'handleQuestionChange').and.returnValue(true);
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToCurrentQuestion']();
        expect(subscriptions.length).toEqual(1);
        const newQuestsion = getMockQuestion();
        questionSubject.next(newQuestsion);
        expect(handleQuestionSpy).toHaveBeenCalledWith(newQuestsion);
    });

    it('isFirstChangeFn should return false', () => {
        const isFirstChange = component['isFirstChangeFn']();
        expect(isFirstChange).toBe(false);
    });

    it('subscribeToBonus() should add a subscription to bonus and display bonus when question ends ', () => {
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToBonus']();
        expect(subscriptions.length).toEqual(1);
        expect(component.bonus).toEqual(0);
        bonusSubject.next(10);
        expect(component.bonus).toEqual(10);
    });

    it('subscribeToCooldown() should add a subscription to cooldown and respond when cooldown starts on play page ', () => {
        component.isCooldown = false;
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToCooldown']();
        expect(subscriptions.length).toEqual(1);
        expect(component.isCooldown).toBe(false);
        booleanSubject.next(true);
        expect(component.isCooldown).toBe(true);
    });

    it('subscribeToCooldown() should set the displayed text to Match Prepare if context is not testPage ', () => {
        component.isCooldown = false;
        component.context = MatchContext.PlayerView;
        component['subscribeToCooldown']();
        booleanSubject.next(true);
        expect(component.currentQuestion.text).toEqual(MatchStatus.PREPARE);
    });

    it('subscribeToCooldown() should not set the displayed text to Match Prepare if context is testPage ', () => {
        component.isCooldown = false;
        component.context = MatchContext.TestPage;
        component['subscribeToCooldown']();
        booleanSubject.next(true);
        expect(component.currentQuestion.text).not.toEqual(MatchStatus.PREPARE);
    });

    it('subscribeToGameEnd() should add a subscription to endGame and respond when game ends ', () => {
        component.isLastQuestion = false;
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToGameEnd']();
        expect(subscriptions.length).toEqual(1);
        expect(component.isLastQuestion).toBe(false);
        booleanSubject.next(true);
        expect(component.isLastQuestion).toBe(true);
    });

    it('subscribeToHostPlaying() should add a subscription to hostPlaying and respond when host quits ', () => {
        booleanSubject.next(true);
        const subscriptions: Subscription[] = (component['eventSubscriptions'] = []);
        component['subscribeToHostPlaying']();
        expect(subscriptions.length).toEqual(1);
        expect(component.isHostPlaying).toBe(true);
        booleanSubject.next(false);
        expect(component.isHostPlaying).toBe(false);
    });
});

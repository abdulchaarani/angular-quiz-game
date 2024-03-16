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
import { Choice } from '@app/interfaces/choice';
import { Question } from '@app/interfaces/question';
import { AnswerService } from '@app/services/answer/answer.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { BONUS_FACTOR } from '@common/constants/match-constants';
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
    let answerSpy: spyObj<AnswerService>;

    beforeEach(async () => {
        const mockHistoryState = {
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
        answerSpy = jasmine.createSpyObj('AnswerService', ['selectChoice', 'deselectChoice', 'submitAnswer', 'feedback', 'bonusPoints']);
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', ['nextQuestion', 'getUsername', 'getMatchRoomCode', 'disconnect', 'sendPlayersData']);
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
        await TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent, MockChatComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule],
            providers: [
                HttpClient,
                { provide: MatchService, useValue: matchSpy },
                { provide: SocketHandlerService, useValue: socketSpy },
                { provide: AnswerService, useValue: answerSpy },
                { provide: MatchRoomService, useValue: matchRoomSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        spyOn(component, 'getHistoryState').and.returnValue(mockHistoryState);
        spyOn<any>(component, 'subscribeToFeedback').and.callFake(() => {
            component.showFeedback = true;
        });
        spyOn<any>(component, 'subscribeToBonus').and.callFake(() => {
            component.bonus = BONUS_FACTOR;
        });
        spyOn<any>(component, 'subscribeToCurrentQuestion').and.callFake(() => {
            component.currentQuestion = mockHistoryState.question;
            matchRoomSpy.nextQuestion();
        });
        spyOn<any>(component, 'subscribeToCooldown').and.callFake(() => {
            if (component.currentQuestion) {
                component.isCooldown = true;
            }
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle enter event', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(component, 'submitAnswers');
        component.handleKeyboardEvent(event);
        expect(component.submitAnswers).toHaveBeenCalled();
    });

    it('should select a choice when a number key is pressed', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        const choice: Choice = { text: 'London', isCorrect: false };
        component.answers = [choice];
        spyOn(component, 'selectChoice');
        component.handleKeyboardEvent(event);
        expect(component.selectChoice).toHaveBeenCalledWith(choice);
    });

    it('should get players', () => {
        matchRoomSpy.players = [
            {
                username: 'test',
                score: 0,
                bonusCount: 0,
                isPlaying: true,
            },
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

    it('should call answerService.selectChoice if context is not hostView and choice is added', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [];
        component.context = 'testPage';

        component.selectChoice(choice);

        expect(answerSpy.selectChoice).toHaveBeenCalledWith(choice.text, { username: component.username, roomCode: component.matchRoomCode });
    });

    it('should call answerService.deselectChoice if context is not hostView and choice is removed', () => {
        const choice: Choice = { text: 'London', isCorrect: false };
        component.isSelectionEnabled = true;
        component.selectedAnswers = [choice];
        component.context = 'testPage';

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

    it('should call matchRoomService.nextQuestion when nextQuestion is called', () => {
        spyOn(component, 'nextQuestion');
        component.nextQuestion();

        expect(matchRoomSpy.nextQuestion).toHaveBeenCalled();
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

    it('should call matchRoomService.disconnect when handleQuit is called', () => {
        component.handleQuit();

        expect(matchRoomSpy.disconnect).toHaveBeenCalled();
    });

    it('should call handleFeedback when feedback is received', () => {
        const feedback = {
            correctAnswer: ['Paris'],
            score: 20,
        };

        component.playerScore = 10;
        component.context = 'testPage';

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

    it('should call handleFeedbackSubmission when feedbackSub is received', () => {
        component['handleFeedbackSubmission']();

        expect(component.showFeedback).toBeTrue();
    });

    it('should handle question change', () => {
        const question: Question = {
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

        spyOn(component, 'ngOnChanges');

        component['handleQuestionChange'](question);

        expect(component.currentQuestion).toEqual(question);

        expect(component.ngOnChanges).toHaveBeenCalledTimes(1);
    });

    it('should handle bonus points', () => {
        const bonus = 5;

        component['handleBonusPoints'](bonus);

        expect(component.bonus).toBe(bonus);
    });

    it('should handle cooldown', () => {
        component['handleCooldown'](true);

        expect(component.isCooldown).toBeTrue();
    });
});

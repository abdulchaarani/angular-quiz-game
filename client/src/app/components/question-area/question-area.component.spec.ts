/* eslint-disable max-lines */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterTestingModule } from '@angular/router/testing';
import { Choice } from '@app/interfaces/choice';
import { MatchService } from '@app/services/match.service';
import { QuestionAreaComponent } from './question-area.component';

import { getMockQuestion } from '@app/constants/question-mocks';
import { getRandomString } from '@app/constants/test-utils';
import { of } from 'rxjs';

const mockHttpResponse: HttpResponse<string> = new HttpResponse({ status: 200, statusText: 'OK', body: JSON.stringify(true) });
describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;

    const mockQuestion = getMockQuestion();
    const timeout = 3000;
    const expectedDuration = 10;

    const noChoiceQuestion = {
        id: getRandomString(),
        type: 'QCM',
        text: getRandomString(),
        points: 30,
        choices: [],
        lastModification: getRandomString(),
    };

    let matchSpy: jasmine.SpyObj<MatchService>;

    beforeEach(async () => {
        matchSpy = jasmine.createSpyObj('MatchService', [
            'getAllGames',
            'advanceQuestion',
            'getBackupGame',
            'saveBackupGame',
            'deleteBackupGame',
            'validateChoices',
        ]);
        await TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent],
            imports: [MatDialogModule, RouterTestingModule, HttpClientTestingModule, MatProgressSpinnerModule],
            providers: [HttpClient, { provide: MatchService, useValue: matchSpy }],
        }).compileComponents();
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        component.currentQuestion = mockQuestion;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check answers', () => {
        component.selectedAnswers = [];
        matchSpy.validateChoices.and.returnValue(of(mockHttpResponse));
        component.checkAnswers();
        expect(component.isCorrect).toBeTruthy();
    });

    it('should select an answer', () => {
        const choice = component.answers[0];
        component.selectChoice(choice);
        expect(component.selectedAnswers).toContain(choice);
    });

    it('should select multiple answers', () => {
        const choice1 = component.answers[0];
        const choice2 = component.answers[component.answers.length - 1];
        component.selectChoice(choice1);
        component.selectChoice(choice2);
        expect(component.selectedAnswers).toContain(choice1);
        expect(component.selectedAnswers).toContain(choice2);
    });

    it('should select an answer on keydown event of the index of the choice', () => {
        const choice = component.answers[0] as Choice;
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).toContain(choice);
    });

    it('should select multiple answers on keydown event of the index of the choice', () => {
        const choice1 = component.answers[0];
        const choice2 = component.answers[1];
        const event1 = new KeyboardEvent('keydown', { key: '1' });
        const event2 = new KeyboardEvent('keydown', { key: '2' });
        component.handleKeyboardEvent(event1);
        component.handleKeyboardEvent(event2);
        expect(component.selectedAnswers).toContain(choice1);
        expect(component.selectedAnswers).toContain(choice2);
    });

    it('should not select an answer on keydown event of the index of the choice if selection is disabled', () => {
        component.isSelectionEnabled = false;
        const choice = component.answers[0];
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).not.toContain(choice);
    });

    it('should not select an answer on keydown event of the index of the choice if the index is out of range', () => {
        const event = new KeyboardEvent('keydown', { key: '0' });
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).toEqual([]);
    });

    it('should unselect an answer on keydown event of the index of the choice', () => {
        const choice = component.answers[0];
        const event = new KeyboardEvent('keydown', { key: '1' });
        component.handleKeyboardEvent(event);
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).not.toContain(choice);
    });

    it('should not select an answer if selection is disabled', () => {
        component.isSelectionEnabled = false;
        const choice = component.answers[0];
        component.selectChoice(choice);
        expect(component.selectedAnswers).not.toContain(choice);
    });

    it('should not unselect an answer if selection is disabled', () => {
        const choice = component.answers[0];
        component.selectChoice(choice);
        component.isSelectionEnabled = false;
        component.selectChoice(choice);
        expect(component.selectedAnswers).toContain(choice);
    });

    it('should deselect an answer', () => {
        const choice = component.answers[0];
        component.selectChoice(choice);
        component.selectChoice(choice);
        expect(component.selectedAnswers).not.toContain(choice);
    });

    it('should submit answers', () => {
        const spy = spyOn(component, 'submitAnswers');
        component.submitAnswers();
        expect(spy).toHaveBeenCalled();
    });

    it('should submit answers when clicking the submit button', () => {
        const spy = spyOn(component, 'submitAnswers');
        const button = fixture.nativeElement.querySelector('#submitButton');
        button.click();
        expect(spy).toHaveBeenCalled();
    });

    it('should submit answers when pressing the enter key', () => {
        const spy = spyOn(component, 'submitAnswers');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(event);
        expect(spy).toHaveBeenCalled();
    });

    it('should not submit answers when pressing the enter key if selection is disabled', () => {
        component.isSelectionEnabled = false;
        const spy = spyOn(component, 'submitAnswers');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should turn off selection after submitting answers', () => {
        component.submitAnswers();
        expect(component.isSelectionEnabled).toBeFalse();
    });

    it('should reset the state for a new question', () => {
        component.isSelectionEnabled = false;
        component.selectedAnswers = component.answers;
        component.isCorrect = true;
        component.showFeedback = true;
        component.resetStateForNewQuestion();
        expect(component.isSelectionEnabled).toBeTrue();
        expect(component.selectedAnswers).toEqual([]);
        expect(component.isCorrect).toBeFalse();
        expect(component.showFeedback).toBeFalse();
    });

    it('should update the player score', () => {
        component.isTestPage = false;
        component.isCorrect = true;
        component.playerScoreUpdate();
        expect(component.playerScore).toEqual(component.currentQuestion.points);
    });

    it('should not update the player score if the question is not correct', () => {
        component.isTestPage = false;
        component.isCorrect = false;
        component.playerScoreUpdate();
        expect(component.playerScore).toEqual(0);
    });

    it('should update the player score with bonus points if the question if its a test page', () => {
        component.playerScore = 0;
        component.isTestPage = true;
        component.isCorrect = true;
        component.playerScoreUpdate();
        expect(component.playerScore).toEqual(component.currentQuestion.points + component.currentQuestion.points * component.bonusFactor);
    });

    it('should not update the player score if the points have already been added', () => {
        component.havePointsBeenAdded = true;
        component.playerScoreUpdate();
        expect(component.playerScore).toEqual(0);
    });

    it('should not update the player score if the question is not correct', () => {
        component.isCorrect = false;
        component.playerScoreUpdate();
        expect(component.playerScore).toEqual(0);
    });

    it('should update the player score after the feedback', () => {
        const spy = spyOn(component, 'playerScoreUpdate');
        component.afterFeedback();
        expect(spy).toHaveBeenCalled();
    });

    it('should advance question after the feedback', fakeAsync(() => {
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {
            return;
        });
        component.afterFeedback();
        tick(timeout);
        expect(matchSpy.advanceQuestion).toHaveBeenCalled();
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should reset the state for a new question after the feedback', fakeAsync(() => {
        const spyResetStateForNewQuestion = spyOn(component, 'resetStateForNewQuestion');
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {
            return;
        });

        component.afterFeedback();
        tick(timeout);
        expect(spyResetStateForNewQuestion).toHaveBeenCalled();
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should set a timeout for the feedback', fakeAsync(() => {
        const spy = spyOn(window, 'setTimeout');
        component.afterFeedback();
        tick(timeout);
        expect(spy).toHaveBeenCalled();
        flush();
    }));

    it('should update the timer if the game duration changes', fakeAsync(() => {
        const spy = spyOn(component.timeService, 'startTimer');
        const newDuration = 10;
        component.gameDuration = 10;
        component.ngOnChanges({
            gameDuration: new SimpleChange(null, newDuration, false),
        });
        tick();
        expect(spy).toHaveBeenCalled();
        flush();
    }));

    it('should only select answer on keydown event of the index of the choice if the key is within the range', () => {
        const event = new KeyboardEvent('keydown', { key: '9' });
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).toEqual([]);
    });

    it('should have all the choices in answers', () => {
        if (mockQuestion.choices) {
            expect(component.answers).toEqual(mockQuestion.choices);
        } else {
            fail();
        }
    });

    it('should have no choices in answers', fakeAsync(() => {
        component.currentQuestion = noChoiceQuestion;
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {
            return;
        });
        component.ngOnInit();
        tick();
        expect(component.answers).toEqual([]);
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should set answers to currentQuestion.choices if it is defined', () => {
        component.currentQuestion = mockQuestion;
        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, false),
        });
        if (mockQuestion.choices) {
            expect(component.answers).toEqual(mockQuestion.choices);
        } else {
            fail();
        }
    });

    it('should set answers to an empty array if currentQuestion.choices is not defined', () => {
        component.currentQuestion = noChoiceQuestion;
        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, false),
        });
        expect(component.answers).toEqual([]);
    });

    it('should start the timer on init', () => {
        const spy = spyOn(component.timeService, 'startTimer');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should stop the timer on init', () => {
        const spy = spyOn(component.timeService, 'stopTimer');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should return true if the choice is selected', () => {
        if (mockQuestion.choices) {
            component.selectedAnswers = [mockQuestion.choices[0]];
            const result = component.isSelected(mockQuestion.choices[0]);
            expect(result).toBeTrue();
        } else {
            fail();
        }
    });

    it('should return false if the choice is not selected', () => {
        component.selectedAnswers = [];
        const result = component.isSelected(component.answers[0]);
        expect(result).toBeFalse();
    });

    it('should return false if the choice is not in the selected answers', () => {
        if (mockQuestion.choices) {
            component.selectedAnswers = [mockQuestion.choices[0]];
            const result = component.isSelected(mockQuestion.choices[1]);
            expect(result).toBeFalse();
        } else {
            fail();
        }
    });

    it('should compute timer progress correctly', () => {
        const expectedProgress = 100;
        component.gameDuration = expectedDuration;
        spyOnProperty(component.timeService, 'time', 'get').and.returnValue(expectedDuration);
        const result = component.computeTimerProgress();
        expect(result).toBe(expectedProgress);
    });

    it('should compute timer progress correctly if the time is 0', () => {
        component.gameDuration = 10;
        spyOnProperty(component.timeService, 'time', 'get').and.returnValue(0);
        const result = component.computeTimerProgress();
        expect(result).toBe(0);
    });

    it('should get time correctly', () => {
        spyOnProperty(component, 'time', 'get').and.returnValue(expectedDuration);
        const result = component.time;
        expect(result).toBe(expectedDuration);
    });
});

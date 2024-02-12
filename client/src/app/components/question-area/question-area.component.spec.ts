import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Choice } from '@app/interfaces/choice';
import { MatchService } from '@app/services/match.service';
import { of, throwError } from 'rxjs';
import { QuestionAreaComponent } from './question-area.component';
describe('QuestionAreaComponent', () => {
    let component: QuestionAreaComponent;
    let fixture: ComponentFixture<QuestionAreaComponent>;

    const fakequestion = {
        id: 'getRandomString',
        type: 'QCM',
        text: 'getRandomString',
        points: 30,
        choices: [
            {
                id: 'getRandomString',
                text: 'getRandomString',
                isCorrect: true,
            },
            {
                id: 'getRandomString',
                text: 'getRandomString',
                isCorrect: false,
            },
            {
                id: 'getRandomStringl',
                text: 'getRandomString',
                isCorrect: false,
            },
        ],
        lastModification: ' new Date(YEAR, 1, 1)',
    };

    const fakequestion2 = {
        id: 'hellohi',
        type: 'QCM',
        text: 'getRandomString',
        points: 30,
        choices: [
            {
                id: 'getRandomString',
                text: 'getRandomString',
                isCorrect: false,
            },
            {
                id: 'getRandomString',
                text: 'getRandomString',
                isCorrect: true,
            },
            {
                id: 'getRandomStringl',
                text: 'getRandomString',
                isCorrect: true,
            },
        ],
        lastModification: ' new Date(YEAR, 4, 2)',
    };

    const nochoicequestion = {
        id: 'getRandomString',
        type: 'QCM',
        text: 'getRandomString',
        points: 30,
        choices: [],
        lastModification: ' new Date(YEAR, 1, 1)',
    };

    let matchService: MatchService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionAreaComponent],
            imports: [MatDialogModule, RouterTestingModule, HttpClientTestingModule],
            providers: [HttpClient, MatchService],
        }).compileComponents();
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        component.currentQuestion = fakequestion;
        matchService = TestBed.inject(MatchService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // // testing the logic of the component
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

    it('should unselecect an answer on keydown event of the index of the choice', () => {
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

    it('should submanswers', () => {
        const spy = spyOn(component, 'submitAnswers');
        component.submitAnswers();
        expect(spy).toHaveBeenCalled();
    });

    it('should submit answers when clicking the submbutton', () => {
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

    it('should check answers', () => {
        const spy = spyOn(component, 'checkAnswers');
        component.checkAnswers();
        expect(spy).toHaveBeenCalled();
    });

    it('should open the chat dialog', () => {
        const spy = spyOn(component.dialog, 'open');
        component.openChatDialog();
        expect(spy).toHaveBeenCalled();
    });

    it('should open the chat dialog when clicking the chat button', () => {
        const spy = spyOn(component.dialog, 'open');
        const button = fixture.nativeElement.querySelector('#chat-icon');
        button.click();
        expect(spy).toHaveBeenCalled();
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
        expect(component.playerScore).toEqual(component.currentQuestion.points + component.currentQuestion.points * component.BONUSFACTOR);
    });

    it('should not update the player score if the points have already been added', () => {
        component.havePointsbeenAdded = true;
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
        const spyAdvanceQuestion = spyOn(matchService, 'advanceQuestion');
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {});
        component.afterFeedback();
        tick(3000);
        expect(spyAdvanceQuestion).toHaveBeenCalled();
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should reset the state for a new question after the feedback', fakeAsync(() => {
        const spyresetStateForNewQuestion = spyOn(component, 'resetStateForNewQuestion');
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {});

        component.afterFeedback();
        tick(3000);
        expect(spyresetStateForNewQuestion).toHaveBeenCalled();
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should set a timeout for the feedback', fakeAsync(() => {
        const spy = spyOn(window, 'setTimeout');
        component.afterFeedback();
        tick(3000);
        expect(spy).toHaveBeenCalled();
        flush();
    }));

    it('should not check answers when pressing the enter key if the timer has not run out', () => {
        const spy = spyOn(component, 'checkAnswers');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.handleKeyboardEvent(event);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not check answers when clicking the submbutton if the timer has not run out', () => {
        const spy = spyOn(component, 'checkAnswers');
        const button = fixture.nativeElement.querySelector('#submitButton');
        button.click();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should update the question if the current question changes', fakeAsync(() => {
        const spyMatchService = spyOn(matchService, 'setQuestionId');
        const spyResetStateForNewQuestion = spyOn(component, 'resetStateForNewQuestion');

        component.currentQuestion = fakequestion2;

        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, fakequestion2, false),
        });

        tick();

        expect(spyMatchService).toHaveBeenCalled();
        expect(spyResetStateForNewQuestion).toHaveBeenCalled();

        flush();
    }));

    it('should update the timer if the game duration changes', fakeAsync(() => {
        const spy = spyOn(component.timeService, 'startTimer');
        component.gameDuration = 10;
        component.ngOnChanges({
            gameDuration: new SimpleChange(null, 10, false),
        });
        tick();
        expect(spy).toHaveBeenCalled();
        flush();
    }));

    it('should check answers on ngInit if the timer has run out', () => {
        const spy = spyOn(component, 'checkAnswers');
        component.timeService.timerFinished$.next(true);
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should not check answers on ngInit if the timer has not run out', () => {
        const spy = spyOn(component, 'checkAnswers');
        component.timeService.timerFinished$.next(false);
        component.ngOnInit();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should validate the answers', fakeAsync(() => {
        const spyValidateChoices = spyOn(matchService, 'validateChoices').and.returnValue(of(new HttpResponse({ body: JSON.stringify(true) })));
        const spyAfterFeedback = spyOn(component, 'afterFeedback');

        component.checkAnswers();
        tick();

        expect(spyValidateChoices).toHaveBeenCalled();
        expect(spyAfterFeedback).toHaveBeenCalled();

        flush();
    }));

    it('should handle an error when validating the answers', fakeAsync(() => {
        const spyValidateChoices = spyOn(matchService, 'validateChoices').and.returnValue(throwError(new HttpErrorResponse({ status: 500 })));
        const spyConsoleError = spyOn(console, 'error');

        component.checkAnswers();
        tick();

        expect(spyValidateChoices).toHaveBeenCalled();
        expect(spyConsoleError).toHaveBeenCalled();

        flush();
    }));

    it('should only select answer on keydown event of the index of the choice if the key is within the range', () => {
        const event = new KeyboardEvent('keydown', { key: '9' });
        component.handleKeyboardEvent(event);
        expect(component.selectedAnswers).toEqual([]);
    });

    it('should have all the choices in answers', () => {
        expect(component.answers).toEqual(fakequestion.choices);
    });

    it('should have no choices in answers', fakeAsync(() => {
        component.currentQuestion = nochoicequestion;
        const spyStartTimer = spyOn(component.timeService, 'startTimer').and.callFake(() => {});
        component.ngOnInit();
        tick();
        expect(component.answers).toEqual([]);
        expect(spyStartTimer).toHaveBeenCalled();
        flush();
    }));

    it('should set answers to currentQuestion.choices if it is defined', () => {
        component.currentQuestion = fakequestion;

        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, false),
        });

        expect(component.answers).toEqual(fakequestion.choices);
    });

    it('should set answers to an empty array if currentQuestion.choices is not defined', () => {
        component.currentQuestion = nochoicequestion;

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

    it('should set the question id on init', () => {
        const spy = spyOn(matchService, 'setQuestionId');
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should set the question id on change', () => {
        const spy = spyOn(matchService, 'setQuestionId');
        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, false),
        });
        expect(spy).toHaveBeenCalled();
    });

    it('should not set the question id on change if the question id is not defined', () => {
        const spy = spyOn(matchService, 'setQuestionId');
        component.currentQuestion = { ...component.currentQuestion, id: undefined };
        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, false),
        });
        expect(spy).not.toHaveBeenCalled();
    });

    it('should return true if the choice is selected', () => {
        component.selectedAnswers = [fakequestion.choices[0]];
        const result = component.isSelected(fakequestion.choices[0]);
        expect(result).toBeTrue();
    });

    it('should return false if the choice is not selected', () => {
        component.selectedAnswers = [];
        const result = component.isSelected(component.answers[0]);
        expect(result).toBeFalse();
    });

    it('should return false if the choice is not in the selected answers', () => {
        component.selectedAnswers = [fakequestion.choices[0]];
        const result = component.isSelected(fakequestion.choices[1]);
        expect(result).toBeFalse();
    });

    it('should compute timer progress correctly', () => {
        component.gameDuration = 10;
        spyOnProperty(component.timeService, 'time', 'get').and.returnValue(10);

        const result = component.computeTimerProgress();

        expect(result).toBe(100);
    });

    it('should compute timer progress correctly if the time is 0', () => {
        component.gameDuration = 10;
        spyOnProperty(component.timeService, 'time', 'get').and.returnValue(0);

        const result = component.computeTimerProgress();

        expect(result).toBe(0);
    });

    it('should get time correctly', () => {
        spyOnProperty(component, 'time', 'get').and.returnValue(10);

        const result = component.time;

        expect(result).toBe(10);
    });

    it('should check answers and set isCorrect to true if response body is true', () => {
        const choicesText = [fakequestion.choices[0].text];
        const response = new HttpResponse({ body: JSON.stringify(true) });
        spyOn(matchService, 'validateChoices').and.returnValue(of(response));

        component.selectedAnswers = [fakequestion.choices[0]];

        component.checkAnswers();

        expect(matchService.validateChoices).toHaveBeenCalledWith(choicesText);
        expect(component.isCorrect).toBeTrue();
    });
});

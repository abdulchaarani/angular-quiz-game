import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Game } from '@app/interfaces/game';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { MatchService } from '@app/services/match/match.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { TimeService } from '@app/services/time/time.service';
import { of } from 'rxjs'; // Add import for 'of' from 'rxjs' package
import { WaitPageComponent } from './wait-page.component';
import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-chat',
    template: '',
})
class MockChatComponent {}

describe('WaitPageComponent', () => {
    let component: WaitPageComponent;
    let fixture: ComponentFixture<WaitPageComponent>;
    let matchRoomSpy: SpyObj<MatchRoomService>;
    let matchSpy: SpyObj<MatchService>;
    let timeSpy: SpyObj<TimeService>;
    let questionContextSpy: SpyObj<QuestionContextService>;

    beforeEach(() => {
        matchRoomSpy = jasmine.createSpyObj('MatchRoomService', [
            'getUsername',
            'banUsername',
            'toggleLock',
            'connect',
            'startMatch',
            'getGameTitleObservable',
            'getStartMatchObservable',
            'matchStarted',
            'beginQuiz',
            'nextQuestion',
        ]);
        matchRoomSpy.getGameTitleObservable.and.returnValue(of(''));
        matchRoomSpy.getStartMatchObservable.and.returnValue(of<void>(undefined));
        matchSpy = jasmine.createSpyObj('MatchService', ['']);
        questionContextSpy = jasmine.createSpyObj('QuestionContextService', ['setContext']);
        timeSpy = jasmine.createSpyObj('TimeService', ['handleTimer', 'handleStopTimer']);
        TestBed.configureTestingModule({
            declarations: [WaitPageComponent, MockChatComponent],
            imports: [HttpClientTestingModule, MatProgressSpinnerModule],
            providers: [
                HttpClient,
                { provide: MatchRoomService, useValue: matchRoomSpy },
                { provide: MatchService, useValue: matchSpy },
                { provide: QuestionContextService, useValue: questionContextSpy },
                { provide: TimeService, useValue: timeSpy },
            ],
        });

        fixture = TestBed.createComponent(WaitPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initalize correctly for the host', () => {
        const mockGame: Game = {
            id: '1',
            title: 'test',
            description: 'test',
            lastModification: '2021-10-10T10:10:10.000Z',
            duration: 100,
            isVisible: true,
            questions: [],
        };
        spyOnProperty(component, 'isHost').and.returnValue(true);
        spyOnProperty(component, 'currentGame').and.returnValue(mockGame);

        component.ngOnInit();

        expect(component.gameTitle).toEqual(mockGame.title);
        expect(questionContextSpy.setContext).toHaveBeenCalledWith('hostView');
    });

    it('should get current game', () => {
        expect(component.currentGame).toEqual(matchSpy.currentGame);
    });

    it('time() should return the time of the timeService', () => {
        const time = 100;
        (component.timeService as any).time = time;
        expect(component.time).toEqual(time);
    });

    it('toggleLock() should call toggleLock of matchRoomService', () => {
        component.toggleLock();
        expect(matchRoomSpy.toggleLock).toHaveBeenCalled();
    });

    it('banUsername() should call banUsername of matchRoomService', () => {
        component.banPlayerUsername('test');
        expect(matchRoomSpy.banUsername).toHaveBeenCalledWith('test');
    });

    it('should prepare start of match', () => {
        component.prepareStartOfMatch();
        expect(component.startTimerButton).toBe(true);
        expect(matchRoomSpy.startMatch).toHaveBeenCalled();
    });

    it('startMatch() should call startMatch from matchRoomService', () => {
        spyOn(component, 'prepareStartOfMatch').and.callFake(() => {
            component.startTimerButton = true;
            component.matchRoomService.startMatch();
            return of(true);
        });
        component.startMatch();
        expect(component.startTimerButton).toBe(true);
        expect(matchRoomSpy.startMatch).toHaveBeenCalled();
    });

    it('nextQuestion() should call beginQuiz from matchRoomService', () => {
        component.nextQuestion();
        expect(matchRoomSpy.beginQuiz).toHaveBeenCalled();
    });
});

import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Choice } from '@app/interfaces/choice';
// import { AnswerService } from '@app/services/answer/answer.service';
import { MatchService } from '@app/services/match/match.service';
import { SocketHandlerService } from '@app/services/socket-handler/socket-handler.service';
import { Socket } from 'socket.io-client';
import { QuestionAreaComponent } from './question-area.component';
import spyObj = jasmine.SpyObj;

class SocketHandlerServiceMock extends SocketHandlerService {
    override connect() {
    }
}

describe('QuestionAreaComponent', () => {
  let component: QuestionAreaComponent;
  let fixture: ComponentFixture<QuestionAreaComponent>;
  let matchSpy: spyObj<MatchService>;
  let router : spyObj<Router>;
  let socketSpy: SocketHandlerServiceMock;
  let socketHelper: SocketTestHelper;
//   let answerServiceSpy: spyObj<AnswerService>;

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
                    { text: 'Madrid', isCorrect: false},
                ],
                lastModification: '2021-07-01T00:00:00.000Z',
            },
            duration: 60,
        };
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        // answerServiceSpy = jasmine.createSpyObj('AnswerService', ['selectChoice', 'deselectChoice', 'submitAnswer', 'feedback', 'bonusPoints']);
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
            declarations: [QuestionAreaComponent],
            imports : [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
            providers: [
                HttpClient,
                { provide: MatchService, useValue: matchSpy },
                { provide: SocketHandlerService, useValue: socketSpy },
                // { provide: AnswerService, useValue: answerServiceSpy },
            ],
        }).compileComponents();
        
        fixture = TestBed.createComponent(QuestionAreaComponent);
        component = fixture.componentInstance;
        spyOn(component, 'getHistoryState').and.returnValue(mockHistoryState);
        fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

    // it('should call answerService.selectChoice if context is not hostView and choice is added', () => {
    //     const choice: Choice = { text: 'London', isCorrect: false };
    //     component.isSelectionEnabled = true;
    //     component.selectedAnswers = [];
    //     component.context = 'testPage';

    //     component.selectChoice(choice);

    //     expect(answerServiceSpy.selectChoice).toHaveBeenCalledWith(choice.text, { username: component.username, roomCode: component.matchRoomCode });
    // });

// it('should call answerService.deselectChoice if context is not hostView and choice is removed', () => {
//     const choice: Choice = { text: 'London', isCorrect: false };
//     component.isSelectionEnabled = true;
//     component.selectedAnswers = [choice];
//     component.context = 'testPage';
//     spyOn(component.answerService, 'deselectChoice');

//     component.selectChoice(choice);

//     expect(component.answerService.deselectChoice).toHaveBeenCalledWith(choice.text, { username: component.username, roomCode: component.matchRoomCode });
// });

// it('should not add or remove the choice if isSelectionEnabled is false', () => {
//     const choice: Choice = { text: 'London', isCorrect: false };
//     component.isSelectionEnabled = false;
//     component.selectedAnswers = [];

//     component.selectChoice(choice);

//     expect(component.selectedAnswers).toEqual([]);
// });
});


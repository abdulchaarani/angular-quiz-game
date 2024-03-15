import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
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
});

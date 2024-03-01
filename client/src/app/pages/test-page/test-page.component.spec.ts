import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { getMockGame } from '@app/constants/game-mocks';
import { MatDialogMock } from '@app/constants/mat-dialog-mock';
import { GamesService } from '@app/services/game/games.service';
import { MatchService } from '@app/services/match/match.service';
import { of } from 'rxjs';
import { TestPageComponent } from './test-page.component';

describe('TestPageComponent', () => {
    let component: TestPageComponent;
    let fixture: ComponentFixture<TestPageComponent>;
    let matchService: MatchService;
    let router: Router;

    const mockGame = getMockGame();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestPageComponent],
            imports: [HttpClientTestingModule],
            providers: [GamesService, Router, MatchService, MatSnackBar, { provide: MatDialog, useClass: MatDialogMock }],
        });
        fixture = TestBed.createComponent(TestPageComponent);
        component = fixture.componentInstance;
        matchService = TestBed.inject(MatchService);
        router = TestBed.inject(Router);
        matchService.currentGame = mockGame;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load game on initialization', () => {
        spyOn(matchService, 'getBackupGame').and.returnValue(of(mockGame));
        component.ngOnInit();
        expect(component.currentGame).toEqual(mockGame);
        expect(component.questions).toEqual(mockGame.questions);
        expect(component.currentQuestion).toEqual(mockGame.questions[0]);
        expect(component.currentQuestionIndex).toEqual(0);
    });

    it('should load game on initialization', () => {
        spyOn(matchService, 'getBackupGame').and.returnValue(of(mockGame));
        component.ngOnInit();
        expect(component.currentGame).toEqual(mockGame);
        expect(component.questions).toEqual(mockGame.questions);
        expect(component.currentQuestion).toEqual(mockGame.questions[0]);
        expect(component.currentQuestionIndex).toEqual(0);
    });

    it('should load game on initialization', () => {
        spyOn(matchService, 'getBackupGame').and.returnValue(of(mockGame));
        component.ngOnInit();
        expect(component.currentGame).toEqual(mockGame);
        expect(component.questions).toEqual(mockGame.questions);
        expect(component.currentQuestion).toEqual(mockGame.questions[0]);
        expect(component.currentQuestionIndex).toEqual(0);
    });

    it('should navigate to "/host" when there are no more questions', () => {
        component.currentGame = mockGame;
        component.currentQuestionIndex = 1;
        spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
        const subSpy = spyOn(component.subscription, 'unsubscribe');
        const deleteBackupGameSpy = spyOn(matchService, 'deleteBackupGame');
        component.advanceQuestion();
        expect(router.navigate).toHaveBeenCalledWith(['/host']);
        expect(subSpy).toHaveBeenCalled();
        expect(deleteBackupGameSpy).toHaveBeenCalledWith(mockGame.id);
    });

    it('should advance to the next question', () => {
        spyOn(matchService, 'getBackupGame').and.returnValue(of(mockGame));
        component.ngOnInit();
        component.advanceQuestion();
        expect(component.currentQuestionIndex).toEqual(1);
        expect(component.currentQuestion).toEqual(mockGame.questions[1]);
    });

    it('should unsubscribe on component destruction', () => {
        spyOn(component.subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(component.subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should advance question on subscription', () => {
        spyOn(matchService['questionAdvanceSubject'], 'next').and.callThrough();
        spyOn(component, 'advanceQuestion');
        component.ngOnInit();
        matchService['questionAdvanceSubject'].next();
        expect(component.advanceQuestion).toHaveBeenCalled();
    });
});

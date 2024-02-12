import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamesService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { TestPageComponent } from './test-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';

xdescribe('TestPageComponent', () => {
    let component: TestPageComponent;
    let fixture: ComponentFixture<TestPageComponent>;
    let gameService: GamesService;
    let matchService: MatchService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestPageComponent],
            imports: [HttpClientTestingModule],
            providers: [GamesService, MatchService, MatSnackBar, { provide: MatDialog, useClass: MatDialogMock }],
        });
        fixture = TestBed.createComponent(TestPageComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GamesService);
        matchService = TestBed.inject(MatchService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should', () => {
        spyOn(gameService, 'getGameById').and.callThrough();
        spyOn(matchService, 'getBackupGame');
    });
});

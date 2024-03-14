import { HttpClient, HttpHandler } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { GameListItemComponent } from '@app/components/game-list-item/game-list-item.component';
import { getMockGame } from '@app/constants/game-mocks';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';
import SpyObj = jasmine.SpyObj;

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gameSpy: SpyObj<GameService>;
    let notificationServiceSpy: SpyObj<NotificationService>;
    let dialogMock: SpyObj<MatDialog>;

    beforeEach(waitForAsync(() => {
        dialogMock = jasmine.createSpyObj({
            open: jasmine.createSpyObj({
                afterClosed: of('mockResult'),
            }),
        });
        gameSpy = jasmine.createSpyObj('GameService', ['getGames', 'deleteGame', 'onFileSelected', 'uploadGame']);
        notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage', 'displaySuccessMessage']);

        TestBed.configureTestingModule({
            imports: [MatDialogModule, MatSnackBarModule, RouterTestingModule, MatIconModule, MatCardModule],
            declarations: [AdminPageComponent, GameListItemComponent],
            providers: [
                HttpClient,
                HttpHandler,
                { provide: MatDialog, useValue: dialogMock },
                { provide: GameService, useValue: gameSpy },
                { provide: NotificationService, useValue: notificationServiceSpy },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get games on init', () => {
        expect(gameSpy.getGames).toHaveBeenCalled();
    });

    it('onDeleteGameFromList should delete the game', () => {
        component.onDeleteGameFromList('mock');
        expect(gameSpy.deleteGame).toHaveBeenCalledWith('mock');
    });

    it('onFileSelected should call the method from the service to handle the file', () => {
        const dataTransfer = new DataTransfer();
        const mockFile = new File([JSON.stringify(getMockGame())], 'file.json', { type: 'application/json' });
        dataTransfer.items.add(mockFile);
        const mockEvent = {
            dataTransfer,
            target: { files: dataTransfer },
        } as unknown as InputEvent;
        component.onFileSelected(mockEvent);
        expect(gameSpy.onFileSelected).toHaveBeenCalledWith(mockEvent);
    });

    it('addGame() should upload the game', () => {
        const mockGame = getMockGame();
        component.addGame(mockGame);
        expect(gameSpy.uploadGame).toHaveBeenCalledWith(mockGame);
    });
});

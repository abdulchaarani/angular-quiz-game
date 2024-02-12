import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NotificationService } from '@app/services/notification.service';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import SpyObj = jasmine.SpyObj;
describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let routerSpy: SpyObj<Router>;
    let notificationSpy: SpyObj<NotificationService>;
    let httpClientSpy: SpyObj<HttpClient>;
    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        notificationSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                MatSnackBar,
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: Router, useValue: routerSpy },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });
        service = TestBed.inject(AuthenticationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('validatePassword() should redirect to /admin/games if password is valid', () => {
        httpClientSpy.post.and.returnValue(of({ status: 200 }));
        service.validatePassword('', '');
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/admin/games');
        expect(service.getIsAuthenticated()).toBeTrue();
    });

    it('validatePassword() should display error message if wrong password', () => {
        httpClientSpy.post.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
        service.validatePassword('', '');
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalledWith('/admin/games');
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
        expect(service.getIsAuthenticated()).toBeFalse();
    });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { NotificationService } from '@app/services/notification.service';
import { authenticationGuard } from './authentication.guard';
import SpyObj = jasmine.SpyObj;
describe('authenticationGuard', () => {
    let authenticationSpy: SpyObj<AuthenticationService>;
    let routerSpy: SpyObj<Router>;
    let notificationSpy: SpyObj<NotificationService>;

    beforeEach(() => {
        authenticationSpy = jasmine.createSpyObj('AuthenticationService', ['getIsAuthenticated']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        notificationSpy = jasmine.createSpyObj('NotificationService', ['displayErrorMessage']);
        TestBed.configureTestingModule({
            providers: [
                { provide: AuthenticationService, useValue: authenticationSpy },
                { provide: Router, useValue: routerSpy },
                { provide: NotificationService, useValue: notificationSpy },
            ],
        });
    });

    it('should redirect to home page if user is not authenticated as admin', () => {
        authenticationSpy.getIsAuthenticated.and.returnValue(false);
        TestBed.runInInjectionContext(authenticationGuard);
        expect(authenticationSpy.getIsAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
        expect(notificationSpy.displayErrorMessage).toHaveBeenCalled();
    });

    it('should redirect to home page if user is not authenticated as admin', () => {
        authenticationSpy.getIsAuthenticated.and.returnValue(true);
        TestBed.runInInjectionContext(authenticationGuard);
        expect(authenticationSpy.getIsAuthenticated).toHaveBeenCalled();
        expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
        expect(notificationSpy.displayErrorMessage).not.toHaveBeenCalled();
    });
});

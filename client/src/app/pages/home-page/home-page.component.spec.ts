import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { DialogAdminPasswordComponent } from '@app/components/dialog-admin-password/dialog-admin-password.component';
import { AuthenticationService } from '@app/services/authentication.service';
import { of } from 'rxjs';
import { HomePageComponent } from './home-page.component';
import SpyObj = jasmine.SpyObj;

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;
    let dialogMock: SpyObj<MatDialog>;
    let authenticationSpy: SpyObj<AuthenticationService>;

    beforeEach(() => {
        dialogMock = jasmine.createSpyObj({
            open: jasmine.createSpyObj({
                afterClosed: of('mockResult'),
            }),
        });
        authenticationSpy = jasmine.createSpyObj('AuthenticationService', ['validatePassword']);
        TestBed.configureTestingModule({
            imports: [HttpClientModule, MatSnackBarModule, MatIconModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: dialogMock,
                },
                {
                    provide: AuthenticationService,
                    useValue: authenticationSpy,
                },
            ],
            declarations: [HomePageComponent],
        });
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the application title and logo', () => {
        const dom = fixture.nativeElement;
        expect(dom.textContent).toContain('Hoot Hoot');
        expect(fixture.debugElement.query(By.css('#game-logo'))).toBeTruthy();
    });

    it('should contain buttons to join a match, create a match, and administrate games', () => {
        expect(fixture.debugElement.query(By.css('#join-button'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('#host-button'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('#admin-button'))).toBeTruthy();
    });

    it('should display the team number and the members names', () => {
        const dom = fixture.nativeElement;
        expect(dom.textContent).toContain('Équipe 305');
        expect(dom.textContent).toContain('Ikram Arroud');
        expect(dom.textContent).toContain('Nada Benelfellah');
        expect(dom.textContent).toContain('Victoria-Mae Carrière');
        expect(dom.textContent).toContain('Abdul-Wahab Chaarani');
        expect(dom.textContent).toContain('Hiba Chaarani');
        expect(dom.textContent).toContain('Adam Kassi-Lahlou');
    });

    it('host button should direct to "/host"', () => {
        const href = fixture.debugElement.query(By.css('#host-button')).nativeElement.getAttribute('routerLink');
        expect(href).toEqual('/host');
    });

    it('openAdminDialog() should open a dialog and allow to submit password', () => {
        const submitPasswordSpy = spyOn(component, 'submitPassword');
        component.password = 'mock';
        component.openAdminDialog();
        expect(dialogMock.open).toHaveBeenCalledWith(DialogAdminPasswordComponent, { data: { password: 'mock' } });
        const closeDialog = () => {
            return dialogMock.closeAll;
        };
        closeDialog();
        expect(submitPasswordSpy).toHaveBeenCalled();
    });

    it('submitPassword() should call validatePassword and reset the input password', () => {
        const mockPassword = 'mockPassword';
        component.submitPassword(mockPassword);
        expect(authenticationSpy.validatePassword).toHaveBeenCalledWith(mockPassword);
        expect(component.password).toEqual('');
    });
});

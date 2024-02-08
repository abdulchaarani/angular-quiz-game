import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { HomePageComponent } from './home-page.component';

// TODO: Test Admin Password
describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientModule],
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
        let href = fixture.debugElement.query(By.css('#host-button')).nativeElement.getAttribute('routerLink');
        expect(href).toEqual('/host');
    });
});

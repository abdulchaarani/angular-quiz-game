/* eslint-disable max-classes-per-file */
// https://medium.com/ngconf/functional-candeactivate-guards-in-angular-2211f5da78c2
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Route, Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { pendingChangesGuard } from './pending-changes.guard';

@Component({ template: '' })
class MockPendingChangesComponent {
    canDeactivate() {
        return false;
    }
}
@Component({ template: '' })
class MockHomeComponent {}

describe('canDeactivateGuard', () => {
    let routes: Route[] = [];
    beforeEach(() => {
        routes = [
            { path: 'home', component: MockHomeComponent },
            { path: 'pending-changes', canDeactivate: [pendingChangesGuard], component: MockPendingChangesComponent },
        ];
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [provideRouter(routes)],
        });
    });

    it('should not allow the component to deactivate if it a pending changes guard and the changes are not discarded', async () => {
        const testRouter = TestBed.inject(Router);
        spyOn(MockPendingChangesComponent.prototype, 'canDeactivate').and.returnValue(false);
        await RouterTestingHarness.create('pending-changes');
        await testRouter.navigateByUrl('home');
        expect(testRouter.url).toEqual('/pending-changes');
    });

    it('should allow the component to deactivate if it had a pending changes guard and the changes are discarded', async () => {
        const testRouter = TestBed.inject(Router);
        spyOn(MockPendingChangesComponent.prototype, 'canDeactivate').and.returnValue(true);
        await RouterTestingHarness.create('pending-changes');
        await testRouter.navigateByUrl('home');
        expect(testRouter.url).toEqual('/home');
    });

    it('should allow the component to deactivate if it has no pending changes guard', async () => {
        const testRouter = TestBed.inject(Router);
        await RouterTestingHarness.create('/home');
        await testRouter.navigateByUrl('pending-changes');
        expect(testRouter.url).toEqual('/pending-changes');
    });
});

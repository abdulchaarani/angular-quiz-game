import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarHarness } from '@angular/material/snack-bar/testing';
import { NotificationService } from './notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('SnackBarHarnessExample', () => {
    let fixture: ComponentFixture<NotificationService>;
    let loader: HarnessLoader;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, NoopAnimationsModule],
            declarations: [NotificationService],
        }).compileComponents();
        fixture = TestBed.createComponent(NotificationService);
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    });

    it('should load a simple success message snackbar', async () => {
        const snackBarRef = fixture.componentInstance.displaySuccessMessage('SUCCESS!');
        let snackBars = await loader.getAllHarnesses(MatSnackBarHarness);

        expect(snackBars.length).toBe(1);

        snackBarRef.dismiss();
        snackBars = await loader.getAllHarnesses(MatSnackBarHarness);
        expect(snackBars.length).toBe(0);
    });

    it('should load a simple failure message snackbar', async () => {
        const snackBarRef = fixture.componentInstance.displaySuccessMessage('FAILURE!');
        let snackBars = await loader.getAllHarnesses(MatSnackBarHarness);

        expect(snackBars.length).toBe(1);

        snackBarRef.dismiss();
        snackBars = await loader.getAllHarnesses(MatSnackBarHarness);
        expect(snackBars.length).toBe(0);
    });
});

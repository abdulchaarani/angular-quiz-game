import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogMock } from '@app/testing/mat-dialog-mock';

describe('AuthenticationService', () => {
    let service: AuthenticationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterModule],
            providers: [MatSnackBar, { provide: MatDialog, useClass: MatDialogMock }],
        });
        service = TestBed.inject(AuthenticationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAdminPasswordComponent } from '@app/components/dialog-admin-password/dialog-admin-password.component';
import { DialogJoinMatchComponent } from '@app/components/dialog-join-match/dialog-join-match.component';
import { AuthenticationService } from '@app/services/authentication.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    password: string;
    code: string;
    constructor(
        private dialog: MatDialog,
        private readonly authenticationService: AuthenticationService,
    ) {}
    openAdminDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { password: this.password },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            this.submitPassword(result);
        });
    }

    openJoinDialog(): void {
        const dialogRef = this.dialog.open(DialogJoinMatchComponent, {
            data: { code: this.code },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            this.submitCode(result);
        });
    }

    submitPassword(password: string): void {
        this.authenticationService.validatePassword(password);
        this.password = '';
    }

    submitCode(code: string): void {
        // TODO: Service
        this.code = '';
    }
}

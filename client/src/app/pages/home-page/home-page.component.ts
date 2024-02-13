import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAdminPasswordComponent } from '@app/components/dialog-admin-password/dialog-admin-password.component';
import { AuthenticationService } from '@app/services/authentication/authentication.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    password: string;
    constructor(
        private dialog: MatDialog,
        private readonly authenticationService: AuthenticationService,
    ) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { password: this.password },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            this.submitPassword(result);
        });
    }

    submitPassword(password: string): void {
        this.authenticationService.validatePassword(password);
        this.password = '';
    }
}

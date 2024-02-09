import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { DialogAdminPasswordComponent } from '../../components/dialog-admin-password/dialog-admin-password.component';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    username: string = 'admin';
    password: string;
    constructor(
        private dialog: MatDialog,
        private readonly authenticationService: AuthenticationService,
    ) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { username: this.username, password: this.password },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.password = result;
            this.authenticationService.validatePassword(this.username, this.password);
            this.password = '';
        });
    }
}

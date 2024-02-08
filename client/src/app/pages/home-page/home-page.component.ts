import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { NotificationService } from '@app/services/notification.service';
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
        public dialog: MatDialog,
        private router: Router,
        private readonly authenticationService: AuthenticationService,
        private readonly notificationService: NotificationService,
    ) {}
    openDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { username: this.username, password: this.password },
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.password = result;
            this.authenticationService.validatePassword(this.username, this.password).subscribe({
                next: () => this.router.navigate(['/admin/games']),
                error: () => this.notificationService.displayErrorMessage(`Le mot de passe est invalide.`),
            });
        });
    }
}

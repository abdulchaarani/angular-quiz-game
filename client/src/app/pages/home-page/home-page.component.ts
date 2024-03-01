import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DialogAdminPasswordComponent } from '@app/components/dialog-admin-password/dialog-admin-password.component';
import { DialogTextInputComponent } from '@app/components/dialog-text-input/dialog-text-input.component';
import { AuthenticationService } from '@app/services/authentication/authentication.service';

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent {
    password: string;
    input: string;
    constructor(
        private dialog: MatDialog,
        private readonly authenticationService: AuthenticationService,
        private router: Router,
    ) {}
    openAdminDialog(): void {
        const dialogRef = this.dialog.open(DialogAdminPasswordComponent, {
            data: { password: this.password },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            if (result) {
                this.submitPassword(result);
            }
        });
    }

    openJoinDialog(): void {
        const dialogRef = this.dialog.open(DialogTextInputComponent, {
            data: { input: this.input, title: 'Joindre une partie', placeholder: "Code d'accès" },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            if (result) {
                this.submitCode(result);
            }
        });
    }

    submitPassword(password: string): void {
        this.authenticationService.validatePassword(password);
        this.password = '';
    }

    submitCode(code: string): void {
        // TODO: Service - Validate code
        console.log('TODO: Valider ' + code);
        this.input = '';
        // TODO: Move in a subscribe/next (only if code is valid)
        const dialogRef = this.dialog.open(DialogTextInputComponent, {
            data: { input: this.input, title: "Veillez saisir un nom d'utilisateur", placeholder: 'Nom' },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            if (result) {
                this.submitUsername(result);
            }
        });
    }

    submitUsername(username: string): void {
        // TODO: Service - Validate username
        console.log('TODO: Valider ' + username);
        this.input = '';
        // TODO: Redirect to page only if username is valid
        this.router.navigateByUrl('/waiting-room');
    }
}

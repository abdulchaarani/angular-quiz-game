import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAdminPasswordComponent } from '@app/components/dialog-admin-password/dialog-admin-password.component';
import { DialogTextInputComponent } from '@app/components/dialog-text-input/dialog-text-input.component';
import { AdminLoginService } from '@app/services/admin-login/admin-login.service';
import { JoinMatchService } from '@app/services/join-match/join-match.service';
import { NotificationService } from '@app/services/notification/notification.service';

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
        private readonly adminLoginService: AdminLoginService,
        private joinMatchService: JoinMatchService,
        private notificationService: NotificationService,
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
        this.adminLoginService.validatePassword(password);
        this.password = '';
    }

    submitCode(roomCode: string): void {
        this.input = '';
        this.joinMatchService.validateMatchRoomCode(roomCode).subscribe({
            next: () => {
                this.openUsernameDialog(roomCode);
            },
            error: () => {
                this.notificationService.displayErrorMessage('Le code est invalide ou la salle de jeu est verrouillée.');
            },
        });
    }

    openUsernameDialog(roomCode: string): void {
        // TODO: Move in a subscribe/next (only if code is valid)
        const dialogRef = this.dialog.open(DialogTextInputComponent, {
            data: { input: this.input, title: "Veillez saisir un nom d'utilisateur", placeholder: 'Nom' },
        });

        dialogRef.afterClosed().subscribe((result: string) => {
            if (result) {
                this.joinMatchService.validateUsername(roomCode, result);
            }
        });
    }
}

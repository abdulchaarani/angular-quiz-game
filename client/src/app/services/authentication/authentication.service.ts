import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../notification.service';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    private isAuthenticated: boolean;
    constructor(
        private readonly http: HttpClient,
        private router: Router,
        private readonly notificationService: NotificationService,
    ) {
        this.isAuthenticated = false;
    }

    validatePassword(inputUsername: string, inputPassword: string): void {
        const contentJsonHeader = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        this.http
            .post(`${environment.serverUrl}/login`, JSON.stringify({ username: inputUsername, password: inputPassword }), {
                observe: 'response',
                headers: contentJsonHeader,
            })
            .subscribe({
                next: () => {
                    this.router.navigate(['/admin/games']);
                    this.isAuthenticated = true;
                },
                error: () => this.notificationService.displayErrorMessage(`Le mot de passe est invalide.`),
            });
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

export const AuthGuard = () => {
    const auth = inject(AuthenticationService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);
    if (!auth.getIsAuthenticated()) {
        router.navigateByUrl('/home');
        notificationService.displayErrorMessage('Accès refusé: Veillez vous connecter avec le bon mot de passe.');
        return false;
    }
    return true;
};

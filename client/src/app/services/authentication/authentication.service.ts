import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
                    this.isAuthenticated = true;
                    this.router.navigate(['/admin/games']);
                },
                error: () => this.notificationService.displayErrorMessage(`Le mot de passe est invalide.`),
            });
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }
}

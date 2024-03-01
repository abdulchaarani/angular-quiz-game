import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { NotificationService } from '@app/services/notification/notification.service';

export const authenticationGuard = (): boolean => {
    const authenticationService = inject(AuthenticationService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);

    if (!authenticationService.getIsAuthenticated()) {
        router.navigateByUrl('/home');
        notificationService.displayErrorMessage('Accès refusé: Veillez vous connecter avec le bon mot de passe.');
        return false;
    }
    return true;
};

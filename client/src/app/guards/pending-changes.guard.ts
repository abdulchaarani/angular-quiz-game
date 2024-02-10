import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { GamesService } from '@app/services/games.service';
import { NotificationService } from '@app/services/notification.service';
import { lastValueFrom } from 'rxjs';

export const pendingChangesGuard: CanDeactivateFn<unknown> = async () => {
    const gameService = inject(GamesService);
    const notificationService = inject(NotificationService);

    if (gameService.isPendingChanges) {
        const confirmation$ = notificationService.openConfirmDialog({
            data: {
                icon: 'warning',
                title: 'Attention',
                text: 'Vous avec des modifications non sauvegardés. Êtes-vous certain de vouloir quitter?',
            },
        });
        return await lastValueFrom(confirmation$);
    }

    return true;
};

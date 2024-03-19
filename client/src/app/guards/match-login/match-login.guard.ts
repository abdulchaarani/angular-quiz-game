import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';

export const matchLoginGuard = (): boolean => {
    const matchRoomService = inject(MatchRoomService);
    const router = inject(Router);
    const notificationService = inject(NotificationService);
    const questionContextService = inject(QuestionContextService);

    if (questionContextService.getContext() === 'testPage' && !matchRoomService.isPlaying) return true;
    if (!matchRoomService.getRoomCode() || !matchRoomService.getUsername() || matchRoomService.isPlaying) {
        router.navigateByUrl('/home');
        notificationService.displayErrorMessage('Accès refusé: Veillez joindre une partie ou créer une partie.');
        return false;
    }
    return true;
};

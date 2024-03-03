import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class JoinMatchService {
    matchRoomCode: string;
    constructor(
        private matchRoomService: MatchRoomService,
        private http: HttpClient,
        private notificationService: NotificationService,
    ) {
        this.matchRoomCode = '';
    }

    // Validation must be with HTTP
    validateMatchRoomCode(matchRoomCode: string) {
        return this.http.post(
            `${environment.serverUrl}/match/validate-code`,
            { matchRoomCode },
            {
                headers: new HttpHeaders({
                    contentType: 'application/json',
                }),
                observe: 'response' as const,
                responseType: 'text' as const,
            },
        );
    }

    validateUsername(username: string): void {
        this.http
            .post(
                `${environment.serverUrl}/match/validate-username`,
                { matchRoomCode: this.matchRoomCode, username },
                {
                    headers: new HttpHeaders({
                        contentType: 'application/json',
                    }),
                    observe: 'response' as const,
                    responseType: 'text' as const,
                },
            )
            .subscribe({
                next: () => {
                    this.addPlayerToMatchRoom(username);
                    this.matchRoomCode = '';
                },
                error: () => {
                    this.notificationService.displayErrorMessage('Le nom ne doit pas être banni, ni être déjà utilisé, ni être "Organisateur".');
                },
            });
    }

    addPlayerToMatchRoom(username: string): void {
        this.matchRoomService.connect();
        this.matchRoomService.joinRoom(this.matchRoomCode, username);
    }
}

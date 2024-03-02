import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatchRoomService } from '../match-room/match-room.service';
import { NotificationService } from '../notification/notification.service';

@Injectable({
    providedIn: 'root',
})
export class JoinMatchService {
    constructor(
        private matchRoomService: MatchRoomService,
        private http: HttpClient,
        private notificationService: NotificationService,
    ) {}

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

    validateUsername(matchRoomCode: string, username: string): void {
        this.http
            .post(
                `${environment.serverUrl}/match/validate-username`,
                { matchRoomCode, username },
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
                    this.connectPlayer();
                    this.joinRoom(matchRoomCode);
                },
                error: () => {
                    this.notificationService.displayErrorMessage('Le nom ne doit pas être banni, ni être déjà utilisé, ni être "Organisateur".');
                },
            });
    }

    connectPlayer() {
        this.matchRoomService.connect();
    }

    joinRoom(roomCode: string) {
        this.matchRoomService.joinRoom(roomCode);
    }
}

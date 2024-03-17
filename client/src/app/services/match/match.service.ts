import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { CommunicationService } from '@app/services/communication/communication.service';
import { MatchRoomService } from '@app/services/match-room/match-room.service';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MatchService extends CommunicationService<Game> {
    questionAdvanced: Subject<void>;
    private currentQuestionId: string;

    private questionAdvanceSubject = new Subject<void>();
    private selectedGame: Game;
    constructor(
        http: HttpClient,
        private readonly matchRoomService: MatchRoomService,
    ) {
        super(http, 'match');
    }

    get questionAdvanced$() {
        return this.questionAdvanceSubject.asObservable();
    }

    get currentGame() {
        return this.selectedGame;
    }

    get questionId() {
        return this.currentQuestionId;
    }
    set currentGame(game: Game) {
        this.selectedGame = game;
    }

    set questionId(id: string) {
        this.currentQuestionId = id;
    }

    getAllGames() {
        return this.getAll('games');
    }

    advanceQuestion() {
        this.questionAdvanceSubject.next();
    }

    getBackupGame(id: string) {
        return this.getById(id, 'backups');
    }

    saveBackupGame(id: string) {
        return this.add(this.currentGame, `backups/${id}`);
    }

    deleteBackupGame(id: string) {
        return this.delete(`backups/${id}`);
    }

    createMatch(isTestPage: boolean = false) {
        this.matchRoomService.connect();
        this.matchRoomService.createRoom(this.selectedGame.id, isTestPage);
    }
}

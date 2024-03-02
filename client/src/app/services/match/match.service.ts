import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Subject } from 'rxjs';
import { ChoiceValidationService } from '../choice-validation/choice-validation.service';
import { CommunicationService } from '../communication/communication.service';
import { MatchRoomService } from '../match-room/match-room.service';

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
        private readonly choiceValidationService: ChoiceValidationService,
        private matchRoomService: MatchRoomService,
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

    createMatch() {
        this.matchRoomService.connect();
        this.matchRoomService.createRoom(JSON.stringify(this.selectedGame));
    }

    validateChoices(choices: string[]) {
        const testChoice = {
            selected: choices,
        };
        return this.choiceValidationService.validateChoices(testChoice, this.currentGame.id, this.questionId);
    }
}

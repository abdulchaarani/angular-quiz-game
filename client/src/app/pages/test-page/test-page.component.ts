import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameService } from '@app/services/game/game.service';
import { MatchService } from '@app/services/match/match.service';
import { QuestionContextService } from '@app/services/question-context/question-context.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-test-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.scss'],
    providers: [GameService],
})
export class TestPageComponent implements OnInit, OnDestroy {
    timeLimit: number;
    questions: Question[] = [];
    currentGame: Game;
    currentQuestion: Question;
    currentQuestionIndex: number;
    subscription: Subscription;
    constructor(
        private matchService: MatchService,
        private router: Router,
        private questionContextService: QuestionContextService,
    ) {
        this.currentQuestionIndex = 0;
        this.currentGame = {} as Game;
    }

    ngOnInit() {
        this.loadGame();
        this.subscription = this.matchService.questionAdvanced$.subscribe(() => {
            this.advanceQuestion();
        });
        this.questionContextService.setContext('testPage');
    }

    loadGame(): void {
        this.matchService.getBackupGame(this.matchService.currentGame.id).subscribe((data: Game) => {
            this.currentGame = data;
            this.questions = data.questions;
            this.currentQuestion = this.questions[0];
            this.currentQuestionIndex = 0;
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        this.matchService.deleteBackupGame(this.currentGame.id);
    }

    advanceQuestion(): void {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.currentQuestion = this.questions[this.currentQuestionIndex];
        } else {
            this.router.navigate(['/host']);
            this.ngOnDestroy();
        }
    }
}

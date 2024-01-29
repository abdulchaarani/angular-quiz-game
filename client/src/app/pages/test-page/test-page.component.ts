import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GamesService } from '@app/services/games.service';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-test-page',
    templateUrl: './test-page.component.html',
    styleUrls: ['./test-page.component.scss'],
    providers: [QuestionService, GamesService],
})
export class TestPageComponent implements OnInit {
    currentGame: Game;
    currentQuestion: Question;
    currentQuestionIndex: number;
    timeLimit: number;
    playerScore: number;
    questions: Question[] = [];

    constructor(
        private gameService: GamesService,
        private questionService: QuestionService,
    ) {
        this.currentQuestionIndex = 0;
    }

    ngOnInit(): void {
        this.gameService.getGameById(0).subscribe((data: Game) => {
            this.currentGame = data;
        });

        this.questionService.getAllQuestions().subscribe((data: Question[]) => {
            this.questions = [...data];
            this.currentQuestion = this.questions[this.currentQuestionIndex];
        });
    }
}

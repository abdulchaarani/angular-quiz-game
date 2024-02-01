import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { Question } from '@app/interfaces/question';
import { GameEventService } from '@app/services/game-event.service';
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
        private gameEventService: GameEventService, // private questionService: QuestionService,
    ) {
        this.currentQuestionIndex = 0;
    }
    ngOnInit(): void {
        this.gameService.getGameById(2).subscribe((data: Game) => {
            this.currentGame = data;
            console.log(this.currentGame.questions);
        });

        // this.questionService.getAllQuestions().subscribe((data: Question[]) => {
        //     this.questions = [...data];
        //     this.currentQuestion = this.questions[this.currentQuestionIndex];
        // });

        this.gameEventService.questionAdvanced$.subscribe(() => {
            this.advanceQuestion();
        });
    }

    private advanceQuestion(): void {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.currentQuestion = this.questions[this.currentQuestionIndex];
        } else {
            console.log('End of questions');
        }
    }
}

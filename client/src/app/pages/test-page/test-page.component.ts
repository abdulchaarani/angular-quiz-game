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
    timeLimit: number;
    playerBonus: number;
    questions: Question[] = [];

    Games: Game[] = [
        {
            id: '1',
            title: 'Questionnaire sur le JS',
            description: 'Questions de pratique sur le langage JavaScript',
            duration: 5,
            lastModification: '2021-07-01T00:00:00.000Z',
            isVisible: true,
            questions: [
                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 20,
                    choices: [
                        {
                            text: 'var',
                            isCorrect: true,
                        },
                        {
                            text: 'self',
                            isCorrect: false,
                        },
                        {
                            text: 'this',
                            isCorrect: true,
                        },
                        {
                            text: 'int',
                            isCorrect: false,
                        },
                    ],
                    lastModification: '2021-07-01T00:00:00.000Z',
                },

                {
                    type: 'QCM',
                    text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                    points: 20,
                    choices: [
                        {
                            text: 'Non',
                            isCorrect: true,
                        },
                        {
                            text: 'Oui',
                            isCorrect: false,
                        },
                    ],
                    lastModification: '2021-07-01T00:00:00.000Z',
                },
            ],
        },
    ];

    currentGame: Game = this.Games[0];
    currentQuestion: Question = this.currentGame.questions[0];
    currentQuestionIndex: number = 0;
    constructor(
        private gameService: GamesService,
        private gameEventService: GameEventService, // private questionService: QuestionService,
    ) {
        this.currentQuestionIndex = 0;
    }

    ngOnInit(): void {
        this.gameService.getGameById('4addad76-0de7-4447-8f4f-ea7a018948a2').subscribe((data: Game) => {
            this.currentGame = data;
            console.log(this.currentGame.questions);
        });

        console.log(this.currentGame);
        this.questions = this.currentGame.questions;
        this.currentQuestion = this.questions[this.currentQuestionIndex];

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
            console.log(this.currentQuestion);
        } else {
            console.log('End of questions');
        }
    }
}

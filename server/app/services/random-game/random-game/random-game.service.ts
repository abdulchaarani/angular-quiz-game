import { Game } from '@app/model/database/game';
import { Question } from '@app/model/database/question';
import { GameCreationService } from '@app/services/game-creation/game-creation.service';
import { QuestionService } from '@app/services/question/question.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RandomGameService {
    MINIMUM_QUESTIONS: number = 5;
    allBankQuestions: Question[] = [];
    randomGame: Game;
    constructor(
        private readonly questionService: QuestionService,
        private gameCreationService: GameCreationService,
    ) {}

    async getAllQuestions() {
        this.allBankQuestions = [...(await this.questionService.getAllQuestions())];
    }

    isRandomGameAvailable(): boolean {
        return this.allBankQuestions.length >= this.MINIMUM_QUESTIONS;
    }

    getRandomQuestions(): Question[] {
        if (this.isRandomGameAvailable()) {
            const randomQuestions: Question[] = [];
            while (randomQuestions.length < this.MINIMUM_QUESTIONS) {
                const randomIndex: number = Math.floor(Math.random() * this.allBankQuestions.length);
                const randomQuestion: Question = this.allBankQuestions[randomIndex];
                if (!randomQuestions.includes(randomQuestion)) {
                    randomQuestions.push(randomQuestion);
                }
            }
            return randomQuestions;
        }
        return [];
    }

    generateRandomGame(): Game {
        const game: Game = {
            id: '',
            title: 'mode aléatoire',
            description: 'mode aléatoire',
            duration: 20,
            isVisible: true,
            questions: this.getRandomQuestions(),
            lastModification: new Date(),
        };

        this.randomGame = this.gameCreationService.generateId(game);

        return this.randomGame;
    }
}

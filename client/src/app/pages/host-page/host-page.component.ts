import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GamesService } from '@app/services/games.service';
// import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-host-page',
    templateUrl: './host-page.component.html',
    styleUrls: ['./host-page.component.scss'],
})
export class HostPageComponent implements OnInit {
    games: Game[] = [];
    selectedGame: Game;

    constructor(
        private gameService: GamesService, // private questionService: QuestionService,
    ) {}

    ngOnInit(): void {
        this.gameService.getGames().subscribe((data: Game[]) => {
            // this.games = [...data];
            this.games = data.filter((game) => game.isVisible);
        });
    }

    selectGame(selectedGame: Game): void {
        if (selectedGame.isVisible && selectedGame) {
            this.selectedGame = selectedGame;
        }
        // TODO : Snackbar to say game unavailable
        console.log(selectedGame);
    }
}

import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '@app/interfaces/player';

@Pipe({
    name: 'sortByScore',
})
export class SortByScorePipe implements PipeTransform {
    transform(players: Player[]): Player[] {
        return players.sort((firstPlayer: Player, secondPlayer: Player) => {
            const scoreComparison = secondPlayer.score - firstPlayer.score;
            const nameComparison = firstPlayer.username > secondPlayer.username ? 1 : -1;
            return scoreComparison !== 0 ? scoreComparison : nameComparison;
        });
    }
}

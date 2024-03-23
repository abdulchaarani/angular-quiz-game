import { Pipe, PipeTransform } from '@angular/core';
import { Player } from '@app/interfaces/player';

const ALTERNATIVE_OPTION = -1;

const compareNames = (firstPlayer: Player, secondPlayer: Player): number => {
    return firstPlayer.username > secondPlayer.username ? 1 : ALTERNATIVE_OPTION;
};

@Pipe({
    name: 'sortPlayers',
})
export class SortPlayersPipe implements PipeTransform {
    transform(players: Player[], sortDirection: string, sortBy: string): Player[] {
        if (sortBy === 'name') {
            return players.sort((firstPlayer: Player, secondPlayer: Player) => {
                return sortDirection === 'ascending'
                    ? compareNames(firstPlayer, secondPlayer)
                    : compareNames(firstPlayer, secondPlayer) * ALTERNATIVE_OPTION;
            });
        }
        if (sortBy === 'score') {
            return players.sort((firstPlayer: Player, secondPlayer: Player) => {
                const scoreComparison =
                    sortDirection === 'ascending' ? firstPlayer.score - secondPlayer.score : secondPlayer.score - firstPlayer.score;
                const nameComparison = compareNames(firstPlayer, secondPlayer);
                return scoreComparison !== 0 ? scoreComparison : nameComparison;
            });
        }
        // TODO: State
        return players;
    }
}

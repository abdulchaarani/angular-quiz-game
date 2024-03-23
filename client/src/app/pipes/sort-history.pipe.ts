import { Pipe, PipeTransform } from '@angular/core';
import { HistoryItem } from '@app/interfaces/history-item';

const REVERSED_INDEX = -1;

@Pipe({
    name: 'sortHistory',
})
export class SortHistoryPipe implements PipeTransform {
    transform(historyItems: HistoryItem[], sortDirection: string, sortBy: string): HistoryItem[] {
        if (sortBy === 'title') {
            return historyItems.sort((a: HistoryItem, b: HistoryItem) => {
                return sortDirection === 'ascending' ? (a.title > b.title ? 1 : REVERSED_INDEX) : a.title > b.title ? REVERSED_INDEX : 1;
            });
        }
        if (sortBy === 'date') {
            return historyItems.sort((a: HistoryItem, b: HistoryItem) => {
                return sortDirection === 'ascending' ? (a.date > b.date ? 1 : REVERSED_INDEX) : a.date > b.date ? REVERSED_INDEX : 1;
            });
        }
        return historyItems;
    }
}

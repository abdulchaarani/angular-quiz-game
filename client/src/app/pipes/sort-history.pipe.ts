import { Pipe, PipeTransform } from '@angular/core';
import { HistoryItem } from '../interfaces/history-item';

@Pipe({
    name: 'sortHistory',
})
export class SortHistoryPipe implements PipeTransform {
    transform(historyItems: HistoryItem[], sortDirection: string, sortBy: string): HistoryItem[] {
        if (sortBy === 'title') {
            return historyItems.sort((a: HistoryItem, b: HistoryItem) => {
                return sortDirection === 'ascending' ? (a.title > b.title ? 1 : -1) : a.title > b.title ? -1 : 1;
            });
        }
        if (sortBy === 'date') {
            return historyItems.sort((a: HistoryItem, b: HistoryItem) => {
                return sortDirection === 'ascending' ? (a.date > b.date ? 1 : -1) : a.date > b.date ? -1 : 1;
            });
        }
        return historyItems;
    }
}

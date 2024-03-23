import { MOCK_HISTORY, MOCK_HISTORY_ITEM_1, MOCK_HISTORY_ITEM_2, MOCK_HISTORY_ITEM_3 } from '@app/constants/history-mocks';
import { HistoryItem } from '@app/interfaces/history-item';
import { SortHistoryPipe } from './sort-history.pipe';

const REVERSED_HISTORY = [MOCK_HISTORY_ITEM_2, MOCK_HISTORY_ITEM_3, MOCK_HISTORY_ITEM_1];

describe('SortHistoryPipe', () => {
    const pipe = new SortHistoryPipe();
    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should sort items by title, ascending order', () => {
        const result = pipe.transform(MOCK_HISTORY, 'ascending', 'title').map((historyItem: HistoryItem) => historyItem.title);
        expect(result).toEqual(['A', 'B', 'C']);

        const resultReversed = pipe.transform(REVERSED_HISTORY, 'ascending', 'title').map((historyItem: HistoryItem) => historyItem.title);
        expect(resultReversed).toEqual(['A', 'B', 'C']);
    });

    it('should sort items by title, descending order', () => {
        const result = pipe.transform(MOCK_HISTORY, 'descending', 'title').map((historyItem: HistoryItem) => historyItem.title);
        expect(result).toEqual(['C', 'B', 'A']);

        const resultReversed = pipe.transform(REVERSED_HISTORY, 'descending', 'title').map((historyItem: HistoryItem) => historyItem.title);
        expect(resultReversed).toEqual(['C', 'B', 'A']);
    });

    it('should sort items by date, asccending order', () => {
        const result = pipe.transform(MOCK_HISTORY, 'ascending', 'date').map((historyItem: HistoryItem) => historyItem.title);
        expect(result).toEqual(['C', 'B', 'A']);

        const resultReversed = pipe.transform(REVERSED_HISTORY, 'ascending', 'date').map((historyItem: HistoryItem) => historyItem.title);
        expect(resultReversed).toEqual(['C', 'B', 'A']);
    });
    it('should sort items by date, descending order', () => {
        const result = pipe.transform(MOCK_HISTORY, 'descending', 'date').map((historyItem: HistoryItem) => historyItem.title);
        expect(result).toEqual(['A', 'B', 'C']);

        const resultReversed = pipe.transform(REVERSED_HISTORY, 'descending', 'date').map((historyItem: HistoryItem) => historyItem.title);
        expect(resultReversed).toEqual(['A', 'B', 'C']);
    });

    it('should return unchanged list if invalid parameters', () => {
        const result = pipe.transform(MOCK_HISTORY, '', '').map((historyItem: HistoryItem) => historyItem.title);
        expect(result).toEqual([MOCK_HISTORY[0].title, MOCK_HISTORY[1].title, MOCK_HISTORY[2].title]);
    });
});

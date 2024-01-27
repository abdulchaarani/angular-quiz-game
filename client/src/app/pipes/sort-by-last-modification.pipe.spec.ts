import { SortByLastModificationPipe } from '@app/pipes/sort-by-last-modification.pipe';

describe('SortByLastModificationPipe', () => {
    it('create an instance', () => {
        const pipe = new SortByLastModificationPipe();
        expect(pipe).toBeTruthy();
    });
});

import { ChoiceTracker } from './choice-tracker';

describe('ChoiceTally', () => {
    let choiceTracker: ChoiceTracker;

    beforeEach(() => {
        choiceTracker = new ChoiceTracker();
    });

    it('should be defined', () => {
        expect(choiceTracker).toBeDefined();
    });

    // it('incrementCount() should increment the count for the specified choice', () => {
    //     choiceTally.incrementCount('choice1');
    //     choiceTally.incrementCount('choice1');
    //     choiceTally.incrementCount('choice2');

    //     expect(choiceTally.get('choice1')).toBe(2);
    //     expect(choiceTally.get('choice2')).toBe(1);
    // });

    // it('decrementCount() should decrement the count for the specified key if count is greater than 0', () => {
    //     choiceTally.set('choice1', 3);
    //     choiceTally.set('choice2', 1);

    //     choiceTally.decrementCount('choice1');
    //     choiceTally.decrementCount('choice2');

    //     expect(choiceTally.get('choice1')).toBe(2);
    //     expect(choiceTally.get('choice2')).toBe(0);
    // });

    // it('decrementCount() should not decrement the count if it is already 0', () => {
    //     choiceTally.set('choice1', 0);

    //     choiceTally.decrementCount('choice1');

    //     expect(choiceTally.get('choice1')).toBe(0);
    // });

    // it('resetChoiceTally() should reset all counts to 0 based on provided choices', () => {
    //     choiceTally.set('choice1', 2);
    //     choiceTally.set('choice2', 3);

    //     const choices = [{ text: 'choice1' }, { text: 'choice2' }, { text: 'choice3' }];
    //     choiceTally.resetChoiceTally(choices);

    //     expect(choiceTally.get('choice1')).toBe(0);
    //     expect(choiceTally.get('choice2')).toBe(0);
    //     expect(choiceTally.has('choice3')).toBe(true);
    // });
});

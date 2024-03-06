import { Choice } from '@app/model/database/choice';

export class ChoiceTally extends Map<string, number> {
    incrementCount(key: string): void {
        const currentValue = this.get(key) || 0;
        this.set(key, currentValue + 1);
    }

    decrementCount(key: string): void {
        const currentValue = this.get(key) || 0;
        if (currentValue > 0) {
            this.set(key, currentValue - 1);
        }
    }

    resetChoiceTally(choices: Choice[]) {
        this.clear();
        choices.forEach((choice: Choice) => {
            this.set(choice.text, 0);
        });
    }
}

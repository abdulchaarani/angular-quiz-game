export class ChoiceTally extends Map<string, number> {
    increment(key: string): void {
        const currentValue = this.get(key) || 0;
        this.set(key, currentValue + 1);
    }

    decrement(key: string): void {
        const currentValue = this.get(key) || 0;
        if (currentValue > 0) {
            this.set(key, currentValue - 1);
        }
    }
}

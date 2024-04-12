import { Injectable } from '@angular/core';
import { MatchContext } from '@app/constants/states';

@Injectable({
    providedIn: 'root',
})
export class MatchContextService {
    private context: MatchContext;

    setContext(context: MatchContext): void {
        this.context = context;
    }

    getContext(): MatchContext {
        return this.context;
    }
}

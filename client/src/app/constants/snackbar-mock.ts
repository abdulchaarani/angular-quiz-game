import { of } from 'rxjs';

export class SnackBarMock {
    onAction() {
        return of(undefined);
    }
}

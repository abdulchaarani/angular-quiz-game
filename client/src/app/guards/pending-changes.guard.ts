// https://medium.com/ngconf/functional-candeactivate-guards-in-angular-2211f5da78c2

import { CanDeactivateFn } from '@angular/router';
import { CanComponentDeactivate } from '@app/interfaces/can-component-deactivate';

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component: CanComponentDeactivate) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};

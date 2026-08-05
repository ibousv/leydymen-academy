import { CanDeactivateFn } from '@angular/router';
import { from, isObservable, Observable, of, switchMap } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate(): boolean | Observable<boolean> | Promise<boolean>;
}

const CONFIRM_MESSAGE = 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?';

function confirmIfNeeded(canLeave: boolean): Observable<boolean> {
  return canLeave ? of(true) : of(window.confirm(CONFIRM_MESSAGE));
}

/**
 * UnsavedChangesGuard — avertit l'utilisateur avant de quitter une page
 * contenant des modifications non sauvegardées (spec §7.1).
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  const canDeactivate = (component as CanComponentDeactivate | null | undefined)?.canDeactivate;
  if (typeof canDeactivate !== 'function') {
    return true;
  }

  const result = canDeactivate.call(component);
  if (isObservable(result)) {
    return result.pipe(switchMap(confirmIfNeeded));
  }
  if (result instanceof Promise) {
    return from(result).pipe(switchMap(confirmIfNeeded));
  }
  return result ? true : window.confirm(CONFIRM_MESSAGE);
};

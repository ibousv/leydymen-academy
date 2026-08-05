import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import type { CanComponentDeactivate } from './unsaved-changes.guard';
import { unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  const nextState = {} as RouterStateSnapshot;

  it('should allow navigation when the component has no canDeactivate method', () => {
    expect(unsavedChangesGuard({} as CanComponentDeactivate, route, state, nextState)).toBe(true);
  });

  it('should allow navigation when canDeactivate returns true', () => {
    const component = { canDeactivate: () => true } as CanComponentDeactivate;
    expect(unsavedChangesGuard(component, route, state, nextState)).toBe(true);
  });

  it('should confirm before leaving when canDeactivate returns false', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const component = { canDeactivate: () => false } as CanComponentDeactivate;
    expect(unsavedChangesGuard(component, route, state, nextState)).toBe(true);
    expect(window.confirm).toHaveBeenCalledWith(
      'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?',
    );
  });

  it('should block navigation when the confirm dialog is dismissed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    const component = { canDeactivate: () => false } as CanComponentDeactivate;
    expect(unsavedChangesGuard(component, route, state, nextState)).toBe(false);
  });

  it('should resolve Promise-based canDeactivate results', async () => {
    const component = { canDeactivate: () => Promise.resolve(true) } as CanComponentDeactivate;
    const result = unsavedChangesGuard(component, route, state, nextState) as Observable<boolean>;
    await expectAsync(firstValueFrom(result)).toBeResolvedTo(true);
  });
});

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTES } from '../../shared/constants';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard — protège les routes nécessitant une authentification (spec §7.1).
 * Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
 * en conservant l'URL d'origine (query param `redirectTo`).
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([ROUTES.login], { queryParams: { redirectTo: state.url } });
};

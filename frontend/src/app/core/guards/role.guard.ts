import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTES } from '../../shared/constants';
import type { UserRole } from '../models';
import { AuthService } from '../services/auth.service';

/**
 * RoleGuard — vérifie le rôle de l'utilisateur pour les routes restreintes (spec §7.1).
 * Les rôles autorisés sont déclarés dans les données de route (`data.roles`).
 * Redirige vers la connexion si non authentifié, vers le tableau de bord si le rôle est insuffisant.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([ROUTES.login], { queryParams: { redirectTo: state.url } });
  }

  const role = authService.getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    return router.createUrlTree([ROUTES.dashboard]);
  }

  return true;
};

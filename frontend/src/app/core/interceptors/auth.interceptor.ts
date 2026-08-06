import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AuthInterceptor — ajoute le token JWT à chaque requête sortante (spec §7.2).
 */
const REFRESH_ENDPOINT = '/auth/refresh-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes(REFRESH_ENDPOINT)) {
    return next(req);
  }
  const token = inject(AuthService).getToken();
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

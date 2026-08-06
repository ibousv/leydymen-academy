import { HttpErrorResponse, type HttpEvent, type HttpHandlerFn, type HttpInterceptorFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscriber, catchError, switchMap, throwError } from 'rxjs';
import { ROUTES } from '../../shared/constants';
import type { ApiError } from '../models';
import { AuthService } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/refresh-token'];

const DEFAULT_MESSAGES: Record<number, string> = {
  401: 'Votre session a expiré. Veuillez vous reconnecter.',
  403: 'Accès refusé.',
  404: 'Ressource introuvable.',
  500: 'Une erreur serveur est survenue.',
};

function toApiError(error: HttpErrorResponse): ApiError {
  const body = error.error as { message?: string; errors?: Record<string, string> } | null;
  return {
    message: body?.message ?? DEFAULT_MESSAGES[error.status] ?? 'Une erreur inattendue est survenue.',
    status: error.status,
    errors: body?.errors,
  };
}

interface QueuedRequest {
  req: HttpRequest<unknown>;
  next: HttpHandlerFn;
  subscriber: Subscriber<HttpEvent<unknown>>;
}

let isRefreshing = false;
let queuedRequests: QueuedRequest[] = [];

function replayRequest(
  authService: AuthService,
  router: Router,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  token: string,
): Observable<HttpEvent<unknown>> {
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        void router.navigate([ROUTES.login], { queryParams: { redirectTo: router.url } });
      }
      return throwError(() => toApiError(error));
    }),
  );
}

function refreshAndRetry(
  authService: AuthService,
  router: Router,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  return authService.refreshToken().pipe(
    switchMap(() => {
      isRefreshing = false;
      const token = authService.getToken();
      const queued = queuedRequests;
      queuedRequests = [];
      for (const item of queued) {
        replayRequest(authService, router, item.req, item.next, token).subscribe(item.subscriber);
      }
      return replayRequest(authService, router, req, next, token);
    }),
    catchError((refreshError: HttpErrorResponse) => {
      isRefreshing = false;
      const queued = queuedRequests;
      queuedRequests = [];
      const apiError = toApiError(refreshError);
      for (const item of queued) {
        item.subscriber.error(apiError);
      }
      authService.logout();
      void router.navigate([ROUTES.login], { queryParams: { redirectTo: router.url } });
      return throwError(() => apiError);
    }),
  );
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = toApiError(error);
      const isAuthRequest = AUTH_ENDPOINTS.some((endpoint) => req.url.includes(endpoint));
      if (error.status === 401 && !isAuthRequest && authService.hasRefreshToken()) {
        if (!isRefreshing) {
          return refreshAndRetry(authService, router, req, next);
        }
        return new Observable<HttpEvent<unknown>>((subscriber) => {
          queuedRequests.push({ req, next, subscriber });
        });
      }
      if (error.status === 401 && !isAuthRequest) {
        authService.logout();
        void router.navigate([ROUTES.login], { queryParams: { redirectTo: router.url } });
      }
      return throwError(() => apiError);
    }),
  );
};

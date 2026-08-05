import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * LoggingInterceptor — log les requêtes HTTP en développement uniquement (spec §7.2).
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production) {
    return next(req);
  }

  const startedAt = Date.now();
  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          console.log(`[HTTP] ${req.method} ${req.urlWithParams} -> ${event.status} (${Date.now() - startedAt} ms)`);
        }
      },
      error: () => {
        console.log(`[HTTP] ${req.method} ${req.urlWithParams} -> ERREUR (${Date.now() - startedAt} ms)`);
      },
    }),
  );
};

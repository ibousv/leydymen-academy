import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * LoadingInterceptor — affiche/cache l'indicateur de chargement global (spec §7.2).
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.add();
  return next(req).pipe(finalize(() => loadingService.remove()));
};

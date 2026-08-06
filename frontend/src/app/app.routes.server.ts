import { RenderMode, ServerRoute } from '@angular/ssr';
import { ROUTE_PATHS } from './shared/constants';

// L'auth repose sur le localStorage du navigateur (invisible au serveur) :
// seules les routes publiques sont pré-rendues, les routes protégées passent en rendu client.
export const serverRoutes: ServerRoute[] = [
  { path: ROUTE_PATHS.login, renderMode: RenderMode.Prerender },
  { path: ROUTE_PATHS.register, renderMode: RenderMode.Prerender },
  { path: ROUTE_PATHS.forgotPassword, renderMode: RenderMode.Prerender },
  { path: ROUTE_PATHS.notFound, renderMode: RenderMode.Prerender },
  { path: ROUTE_PATHS.serverError, renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];

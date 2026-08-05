import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { STORAGE_KEYS } from '../../shared/constants';
import type { ApiError } from '../models';
import { AuthService } from '../services/auth.service';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate'), url: '/dashboard' } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should logout and redirect to login on a 401 for a protected endpoint', () => {
    spyOn(authService, 'logout');
    http.get('/api/formations').subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/formations').flush({ message: 'Session expirée' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { redirectTo: '/dashboard' } });
  });

  it('should not redirect on a 401 for an auth endpoint', () => {
    spyOn(authService, 'logout');
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/auth/login').flush({ message: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should rethrow an ApiError with the server message and status', () => {
    let error: ApiError | undefined;
    http.get('/api/formations').subscribe({ error: (err: ApiError) => (error = err) });
    httpTesting.expectOne('/api/formations').flush({ message: 'Erreur serveur' }, { status: 500, statusText: 'Internal Server Error' });

    expect(error?.status).toBe(500);
    expect(error?.message).toBe('Erreur serveur');
  });

  it('should fall back to a default message when the body has none', () => {
    let error: ApiError | undefined;
    http.get('/api/formations').subscribe({ error: (err: ApiError) => (error = err) });
    httpTesting.expectOne('/api/formations').flush(null, { status: 404, statusText: 'Not Found' });

    expect(error?.status).toBe(404);
    expect(error?.message).toBe('Ressource introuvable.');
  });

  it('should refresh the token and retry the request on a 401', () => {
    localStorage.setItem(STORAGE_KEYS.token, 'mock-token-1');
    localStorage.setItem(STORAGE_KEYS.refreshToken, 'mock-refresh-1');
    spyOn(authService, 'logout');
    http.get('/api/formations').subscribe({ error: () => undefined });

    httpTesting
      .expectOne('/api/formations')
      .flush({ message: 'Session expirée' }, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTesting.expectOne('http://localhost:4000/api/auth/refresh-token');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'mock-refresh-1' });
    expect(refreshReq.request.headers.has('Authorization')).toBeFalse();
    refreshReq.flush({ token: 'mock-token-1', refreshToken: 'mock-refresh-1' });

    const retried = httpTesting.expectOne('/api/formations');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer mock-token-1');
    retried.flush({ items: [], total: 0, page: 1, pageSize: 6 });

    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('should logout and redirect when the refresh token is rejected', () => {
    localStorage.setItem(STORAGE_KEYS.refreshToken, 'mock-refresh-1');
    spyOn(authService, 'logout');
    http.get('/api/formations').subscribe({ error: () => undefined });

    httpTesting
      .expectOne('/api/formations')
      .flush({ message: 'Session expirée' }, { status: 401, statusText: 'Unauthorized' });

    httpTesting
      .expectOne('http://localhost:4000/api/auth/refresh-token')
      .flush({ message: 'Session expirée' }, { status: 401, statusText: 'Unauthorized' });

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { redirectTo: '/dashboard' } });
  });
});

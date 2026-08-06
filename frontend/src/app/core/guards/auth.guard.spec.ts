import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  function setup(isAuthenticated: () => boolean): Router {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated } }],
    });
    return TestBed.inject(Router);
  }

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/dashboard' } as RouterStateSnapshot;

  it('should allow access when the user is authenticated', () => {
    setup(() => true);
    expect(TestBed.runInInjectionContext(() => authGuard(route, state))).toBe(true);
  });

  it('should redirect to login when the user is not authenticated', () => {
    setup(() => false);
    const result = TestBed.runInInjectionContext(() => authGuard(route, state)) as UrlTree;
    expect(result.toString()).toContain('login');
    expect(result.queryParams['redirectTo']).toBe('/dashboard');
  });
});

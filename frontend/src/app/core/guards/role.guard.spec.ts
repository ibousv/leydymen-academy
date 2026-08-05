import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import type { UserRole } from '../models';
import { AuthService } from '../services/auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  function setup(isAuthenticated: () => boolean, getUserRole: () => UserRole | null): Router {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated, getUserRole } }],
    });
    return TestBed.inject(Router);
  }

  const route = (roles?: UserRole[]) => ({ data: { roles } }) as unknown as ActivatedRouteSnapshot;
  const state = { url: '/admin' } as RouterStateSnapshot;

  it('should allow access when no roles are declared', () => {
    setup(() => true, () => 'STUDENT');
    expect(TestBed.runInInjectionContext(() => roleGuard(route(undefined), state))).toBe(true);
  });

  it('should allow access when the user role matches', () => {
    setup(() => true, () => 'ADMIN');
    expect(TestBed.runInInjectionContext(() => roleGuard(route(['ADMIN']), state))).toBe(true);
  });

  it('should redirect to login when the user is not authenticated', () => {
    setup(() => false, () => null);
    const result = TestBed.runInInjectionContext(() => roleGuard(route(['ADMIN']), state)) as UrlTree;
    expect(result.toString()).toContain('login');
  });

  it('should redirect to the dashboard when the role is not allowed', () => {
    setup(() => true, () => 'STUDENT');
    const result = TestBed.runInInjectionContext(() => roleGuard(route(['ADMIN', 'INSTRUCTOR']), state)) as UrlTree;
    expect(result.toString()).toContain('dashboard');
  });
});

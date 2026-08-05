import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services';
import type { LoginResponse, User } from '../../../core/models';

const mockUser: User = {
  id: 1,
  firstName: 'Admin',
  lastName: 'Academy',
  email: 'admin@leydymen.com',
  username: 'admin',
  role: 'ADMIN',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-01-01T00:00:00Z',
};

const mockLoginResponse: LoginResponse = {
  token: 'mock-token-1',
  refreshToken: 'mock-refresh-1',
  user: mockUser,
};

describe('LoginComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  function fillForm(fixture: ReturnType<typeof TestBed.createComponent<LoginComponent>>): void {
    const username = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('input[type="password"]') as HTMLInputElement;
    username.value = 'admin';
    username.dispatchEvent(new Event('input'));
    password.value = 'admin123';
    password.dispatchEvent(new Event('input'));
  }

  it('should call login with the credentials on a valid submit', () => {
    authService.login.and.returnValue(of(mockLoginResponse));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fillForm(fixture);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(authService.login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' });
  });

  it('should display the server error message on failure', () => {
    authService.login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Identifiants invalides' } })),
    );
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fillForm(fixture);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.auth-card__error')?.textContent).toContain(
      'Identifiants invalides',
    );
  });

  it('should not call login when the form is empty', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(authService.login).not.toHaveBeenCalled();
  });
});

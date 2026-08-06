import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services';

describe('ForgotPasswordComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['forgotPassword']);
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  it('should call forgotPassword and display the success message', () => {
    authService.forgotPassword.and.returnValue(
      of({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' }),
    );
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();
    const email = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    email.value = 'awa@example.com';
    email.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(authService.forgotPassword).toHaveBeenCalledWith({ email: 'awa@example.com' });
    expect(fixture.nativeElement.querySelector('.auth-card__success')).toBeTruthy();
  });

  it('should not call forgotPassword when the form is empty', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(authService.forgotPassword).not.toHaveBeenCalled();
  });
});

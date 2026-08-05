import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services';
import type { User } from '../../../core/models';

const mockUser: User = {
  id: 1,
  firstName: 'Awa',
  lastName: 'Diallo',
  email: 'awa@example.com',
  username: 'awa.diallo',
  role: 'STUDENT',
  status: 'active',
  createdAt: '2026-01-01T00:00:00Z',
  lastActive: '2026-01-01T00:00:00Z',
};

describe('RegisterComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register']);
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();
  });

  function getInputs(fixture: ReturnType<typeof TestBed.createComponent<RegisterComponent>>): {
    firstName: HTMLInputElement;
    lastName: HTMLInputElement;
    email: HTMLInputElement;
    username: HTMLInputElement;
    password: HTMLInputElement;
    confirmPassword: HTMLInputElement;
    terms: HTMLInputElement;
  } {
    const compiled = fixture.nativeElement as HTMLElement;
    const byPlaceholder = (placeholder: string): HTMLInputElement =>
      compiled.querySelector<HTMLInputElement>(`input[placeholder="${placeholder}"]`)!;
    return {
      firstName: byPlaceholder('ex. Awa'),
      lastName: byPlaceholder('ex. Diallo'),
      email: byPlaceholder('ex. awa@example.com'),
      username: byPlaceholder('ex. awa.diallo'),
      password: byPlaceholder('Votre mot de passe'),
      confirmPassword: byPlaceholder('Répétez votre mot de passe'),
      terms: compiled.querySelector<HTMLInputElement>('input[type="checkbox"]')!,
    };
  }

  function fillValidForm(fixture: ReturnType<typeof TestBed.createComponent<RegisterComponent>>): void {
    const inputs = getInputs(fixture);
    const values: Array<[HTMLInputElement, string | boolean]> = [
      [inputs.firstName, 'Awa'],
      [inputs.lastName, 'Diallo'],
      [inputs.email, 'awa@example.com'],
      [inputs.username, 'awa.diallo'],
      [inputs.password, 'Password1!'],
      [inputs.confirmPassword, 'Password1!'],
      [inputs.terms, true],
    ];
    for (const [input, value] of values) {
      if (typeof value === 'boolean') {
        input.checked = value;
        input.dispatchEvent(new Event('change'));
      } else {
        input.value = value;
        input.dispatchEvent(new Event('input'));
      }
    }
  }

  it('should call register with the payload on a valid submit', () => {
    authService.register.and.returnValue(of(mockUser));
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'Awa',
      lastName: 'Diallo',
      email: 'awa@example.com',
      username: 'awa.diallo',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      termsAccepted: true,
    });
  });

  it('should display the server error and field errors on 409', () => {
    authService.register.and.returnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 409,
          error: {
            message: 'Cet email ou ce nom d\'utilisateur est déjà utilisé',
            errors: { email: 'Cet email est déjà utilisé', username: '' },
          },
        }),
      ),
    );
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    fillValidForm(fixture);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Cet email est déjà utilisé');
  });

  it('should not call register when the form is empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(authService.register).not.toHaveBeenCalled();
  });
});

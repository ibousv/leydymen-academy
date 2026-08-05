import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { APP_NAME, ROUTES } from '../../../shared/constants';
import { AuthService } from '../../../core/services';

interface PasswordStrength {
  level: number;
  label: string;
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  const errors: Record<string, boolean> = {};
  if (value.length < 8) {
    errors['minlength'] = true;
  }
  if (!/[A-Z]/.test(value)) {
    errors['uppercase'] = true;
  }
  if (!/[a-z]/.test(value)) {
    errors['lowercase'] = true;
  }
  if (!/\d/.test(value)) {
    errors['digit'] = true;
  }
  if (!/[^A-Za-z0-9]/.test(value)) {
    errors['special'] = true;
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string;
  const confirmPassword = group.get('confirmPassword')?.value as string;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

function computePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { level: 0, label: '' };
  }
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 1, label: 'Faible' };
  if (score === 3) return { level: 2, label: 'Moyen' };
  return { level: 3, label: 'Fort' };
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly registerForm = new FormGroup(
    {
      firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      username: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      password: new FormControl('', { nonNullable: true, validators: [Validators.required, strongPasswordValidator] }),
      confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      termsAccepted: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
    },
    { validators: [passwordsMatchValidator] },
  );

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly fieldErrors = signal<{ email: string; username: string }>({ email: '', username: '' });

  protected readonly APP_NAME = APP_NAME;
  protected readonly ROUTES = ROUTES;

  protected readonly passwordStrength = computed(() =>
    computePasswordStrength(this.registerForm.controls.password.value),
  );

  protected onSubmit(): void {
    if (this.loading() || this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.fieldErrors.set({ email: '', username: '' });
    const { firstName, lastName, email, username, password, confirmPassword, termsAccepted } =
      this.registerForm.getRawValue();
    this.authService.register({ firstName, lastName, email, username, password, confirmPassword, termsAccepted }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([ROUTES.login]);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.handleServerError(error);
      },
    });
  }

  protected fieldError(
    controlName: 'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'confirmPassword',
  ): string {
    if (controlName === 'confirmPassword' && this.registerForm.hasError('passwordsMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }
    const control = this.registerForm.controls[controlName];
    if (!control.touched) {
      return '';
    }
    const messages: Record<string, string> = {
      required: 'Ce champ est requis',
      email: 'Adresse email invalide',
      minlength: 'Au moins 3 caractères',
      uppercase: 'Une majuscule requise',
      lowercase: 'Une minuscule requise',
      digit: 'Un chiffre requis',
      special: 'Un caractère spécial requis',
    };
    const errorKey = Object.keys(control.errors ?? {})[0];
    if (!errorKey) {
      return '';
    }
    if (controlName === 'password' && errorKey === 'minlength') {
      return 'Au moins 8 caractères';
    }
    return messages[errorKey] ?? '';
  }

  protected termsError(): string {
    const control = this.registerForm.controls.termsAccepted;
    return control.touched && control.hasError('required') ? 'Vous devez accepter les conditions' : '';
  }

  private handleServerError(error: HttpErrorResponse): void {
    const body = error.error as { message?: string; errors?: { email?: string; username?: string } } | null;
    this.fieldErrors.set({
      email: body?.errors?.email ?? '',
      username: body?.errors?.username ?? '',
    });
    this.errorMessage.set(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { APP_NAME, ROUTES } from '../../../shared/constants';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(true, { nonNullable: true }),
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly APP_NAME = APP_NAME;
  protected readonly ROUTES = ROUTES;

  protected onSubmit(): void {
    if (this.loading() || this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    const { username, password } = this.loginForm.getRawValue();
    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate([ROUTES.dashboard]);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.extractErrorMessage(error));
      },
    });
  }

  protected usernameError(): string {
    const control = this.loginForm.controls.username;
    if (control.touched && control.hasError('required')) {
      return "Le nom d'utilisateur est requis";
    }
    return '';
  }

  protected passwordError(): string {
    const control = this.loginForm.controls.password;
    if (control.touched && control.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    return '';
  }

  private extractErrorMessage(error: HttpErrorResponse): string {
    const body = error.error as { message?: string } | null;
    return body?.message ?? 'Une erreur est survenue. Veuillez réessayer.';
  }
}

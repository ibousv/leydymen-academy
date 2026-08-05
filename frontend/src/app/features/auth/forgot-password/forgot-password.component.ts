import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { APP_NAME, ROUTES } from '../../../shared/constants';
import { AuthService } from '../../../core/services';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  protected readonly forgotForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  });

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly APP_NAME = APP_NAME;
  protected readonly ROUTES = ROUTES;

  protected onSubmit(): void {
    if (this.loading() || this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.authService.forgotPassword({ email: this.forgotForm.getRawValue().email }).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.successMessage.set(response.message);
      },
      error: (error: HttpErrorResponse) => {
        this.loading.set(false);
        const body = error.error as { message?: string } | null;
        this.errorMessage.set(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
      },
    });
  }

  protected emailError(): string {
    const control = this.forgotForm.controls.email;
    if (control.touched && control.hasError('required')) {
      return 'Votre email est requis';
    }
    if (control.touched && control.hasError('email')) {
      return 'Adresse email invalide';
    }
    return '';
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ROUTES } from '../../../shared/constants';
import { AuthService, UserService } from '../../../core/services';
import type { User } from '../../../core/models';

/** Édition du profil utilisateur (spec §4.7.2). */
@Component({
  selector: 'app-profile-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, InputComponent],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.css',
})
export class ProfileEditComponent {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly savingProfile = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly profileNotice = signal('');
  protected readonly passwordNotice = signal('');

  protected readonly profileForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    bio: new FormControl(''),
    location: new FormControl(''),
    website: new FormControl(''),
    avatar: new FormControl(''),
  });

  protected readonly passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  protected readonly profileError = new FormControl('');

  private currentUser: User | null = null;

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => this.patchProfile(user),
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected firstNameError(): string {
    const control = this.profileForm.controls.firstName;
    return control.touched && control.invalid ? 'Le prénom est obligatoire.' : '';
  }

  protected lastNameError(): string {
    const control = this.profileForm.controls.lastName;
    return control.touched && control.invalid ? 'Le nom est obligatoire.' : '';
  }

  protected emailError(): string {
    const control = this.profileForm.controls.email;
    if (!control.touched || !control.invalid) {
      return '';
    }
    return control.errors?.['email'] ? 'Adresse email invalide.' : "L'adresse email est obligatoire.";
  }

  protected currentPasswordError(): string {
    const control = this.passwordForm.controls.currentPassword;
    return control.touched && control.invalid ? 'Le mot de passe actuel est obligatoire.' : '';
  }

  protected newPasswordError(): string {
    const control = this.passwordForm.controls.newPassword;
    if (!control.touched || !control.invalid) {
      return '';
    }
    return control.errors?.['minlength'] ? 'Au moins 6 caractères.' : 'Le nouveau mot de passe est obligatoire.';
  }

  protected confirmPasswordError(): string {
    const form = this.passwordForm;
    if (!form.controls.confirmPassword.touched) {
      return '';
    }
    if (form.controls.newPassword.value !== form.controls.confirmPassword.value) {
      return 'Les mots de passe ne correspondent pas.';
    }
    return form.controls.confirmPassword.invalid ? 'Confirmez le nouveau mot de passe.' : '';
  }

  protected onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.userService.uploadProfileImage(file).subscribe({
      next: (imageUrl) => {
        this.profileForm.controls.avatar.setValue(imageUrl);
        this.profileNotice.set('Avatar mis à jour.');
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected saveProfile(): void {
    this.profileError.setValue('');
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) {
      return;
    }
    const value = this.profileForm.value;
    const payload = {
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      email: value.email ?? '',
      bio: value.bio ?? '',
      location: value.location ?? '',
      website: value.website ?? '',
      avatar: value.avatar ?? '',
    };
    this.savingProfile.set(true);
    this.userService.updateUser(this.currentUserId(), payload).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.profileNotice.set('Profil mis à jour avec succès.');
      },
      error: (error: HttpErrorResponse) => {
        this.savingProfile.set(false);
        this.handleError(error);
      },
    });
  }

  protected savePassword(): void {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid || this.passwordForm.controls.newPassword.value !== this.passwordForm.controls.confirmPassword.value) {
      return;
    }
    this.savingPassword.set(true);
    this.userService
      .changePassword({
        currentPassword: this.passwordForm.controls.currentPassword.value ?? '',
        newPassword: this.passwordForm.controls.newPassword.value ?? '',
        confirmPassword: this.passwordForm.controls.confirmPassword.value ?? '',
      })
      .subscribe({
        next: () => {
          this.savingPassword.set(false);
          this.passwordNotice.set('Mot de passe modifié avec succès.');
          this.passwordForm.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.savingPassword.set(false);
          this.handleError(error);
        },
      });
  }

  private currentUserId(): number {
    return this.currentUser?.id ?? 0;
  }

  private patchProfile(user: User): void {
    this.currentUser = user;
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio ?? '',
      location: user.location ?? '',
      website: user.website ?? '',
      avatar: user.avatar ?? '',
    });
    this.loading.set(false);
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Une erreur est survenue. Veuillez réessayer.');
  }
}

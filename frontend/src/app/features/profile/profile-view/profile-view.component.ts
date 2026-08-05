import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ROUTES } from '../../../shared/constants';
import { AuthService, EnrollmentService } from '../../../core/services';
import type { Enrollment, User } from '../../../core/models';

/** Vue du profil utilisateur (spec §4.7.1). */
@Component({
  selector: 'app-profile-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  private readonly authService = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly user = signal<User | null>(null);
  protected readonly enrollments = signal<Enrollment[]>([]);

  protected readonly enrolledCount = computed(() => this.enrollments().length);
  protected readonly completedCount = computed(
    () => this.enrollments().filter((enrollment) => enrollment.status === 'completed').length,
  );

  protected readonly initials = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'INSTRUCTOR':
        return 'Instructeur';
      case 'STUDENT':
        return 'Étudiant';
      default:
        return '';
    }
  });

  protected readonly statusVariant = computed<BadgeVariant>(() => {
    switch (this.user()?.status) {
      case 'active':
        return 'success';
      case 'banned':
        return 'error';
      default:
        return 'neutral';
    }
  });

  protected readonly statusLabel = computed(() => {
    switch (this.user()?.status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'banned':
        return 'Banni';
      default:
        return '';
    }
  });

  constructor() {
    forkJoin({
      user: this.authService.getCurrentUser(),
      enrollments: this.enrollmentService.getEnrollments(),
    }).subscribe({
      next: ({ user, enrollments }) => {
        this.user.set(user);
        this.enrollments.set(enrollments);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected formatLastActive(iso: string): string {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger votre profil. Veuillez réessayer.');
  }
}

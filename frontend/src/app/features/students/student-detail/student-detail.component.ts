import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ProgressComponent, ProgressVariant } from '../../../shared/components/progress/progress.component';
import { ROUTES } from '../../../shared/constants';
import { EnrollmentService, StatisticsService, UserService } from '../../../core/services';
import type { Enrollment, EnrollmentStatus, User, UserStats, UserStatus } from '../../../core/models';

const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  banned: 'Banni',
};

const STATUS_VARIANTS: Record<UserStatus, BadgeVariant> = {
  active: 'success',
  inactive: 'neutral',
  banned: 'error',
};

const ENROLLMENT_LABELS: Record<EnrollmentStatus, string> = {
  in_progress: 'En cours',
  completed: 'Terminée',
  dropped: 'Abandonnée',
};

const ENROLLMENT_VARIANTS: Record<EnrollmentStatus, BadgeVariant> = {
  in_progress: 'primary',
  completed: 'success',
  dropped: 'error',
};

const ENROLLMENT_PROGRESS: Record<EnrollmentStatus, ProgressVariant> = {
  in_progress: 'primary',
  completed: 'success',
  dropped: 'error',
};

/** Profil détaillé d'un étudiant (spec §4.4.2). */
@Component({
  selector: 'app-student-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ButtonComponent, ProgressComponent],
  templateUrl: './student-detail.component.html',
  styleUrl: './student-detail.component.css',
})
export class StudentDetailComponent {
  private readonly userService = inject(UserService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly notice = signal('');
  protected readonly deactivating = signal(false);
  protected readonly deleting = signal(false);

  protected readonly student = signal<User | null>(null);
  protected readonly enrollments = signal<Enrollment[]>([]);
  protected readonly stats = signal<UserStats | null>(null);

  private studentId = 0;

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage.set('Étudiant introuvable.');
        this.loading.set(false);
        return;
      }
      this.studentId = id;
      this.loadData(id);
    });
  }

  protected statusLabel(status: UserStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusVariant(status: UserStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  protected enrollmentLabel(status: EnrollmentStatus): string {
    return ENROLLMENT_LABELS[status];
  }

  protected enrollmentVariant(status: EnrollmentStatus): BadgeVariant {
    return ENROLLMENT_VARIANTS[status];
  }

  protected progressVariant(status: EnrollmentStatus): ProgressVariant {
    return ENROLLMENT_PROGRESS[status];
  }

  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected avatarInitials(user: User): string {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  protected formatGrade(enrollment: Enrollment): string {
    return enrollment.grade == null ? '—' : `${enrollment.grade}/20`;
  }

  protected formationTitle(enrollment: Enrollment): string {
    return enrollment.formation?.title ?? `Formation #${enrollment.formationId}`;
  }

  protected messageStudent(): void {
    const student = this.student();
    if (student) {
      window.location.href = `mailto:${student.email}`;
    }
  }

  protected downloadTranscript(): void {
    const rows = [
      ['Formation', 'Statut', 'Progression', 'Note', "Date d'inscription"],
      ...this.enrollments().map((enrollment) => [
        this.formationTitle(enrollment),
        ENROLLMENT_LABELS[enrollment.status],
        `${enrollment.completionPercent}%`,
        this.formatGrade(enrollment),
        this.formatDate(enrollment.enrollmentDate),
      ]),
    ];
    this.downloadCsv(rows, 'releve-etudiant.csv');
  }

  protected deactivate(): void {
    const student = this.student();
    if (!student || student.status === 'inactive' || this.deactivating()) {
      return;
    }
    this.deactivating.set(true);
    this.userService.updateUser(student.id, { status: 'inactive' }).subscribe({
      next: () => {
        this.deactivating.set(false);
        this.notice.set(`Le compte de ${student.firstName} ${student.lastName} a été désactivé.`);
        this.loadData(this.studentId);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  protected delete(): void {
    const student = this.student();
    if (!student || this.deleting()) {
      return;
    }
    this.deleting.set(true);
    this.userService.deleteUser(student.id).subscribe({
      next: () => {
        void this.router.navigate([ROUTES.students]);
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        this.handleError(error);
      },
    });
  }

  private loadData(id: number): void {
    forkJoin({
      user: this.userService.getUser(id),
      enrollments: this.enrollmentService.getEnrollments({ studentId: id }),
      stats: this.statisticsService.getUserStats(id),
    }).subscribe({
      next: ({ user, enrollments, stats }) => {
        this.student.set(user);
        this.enrollments.set(enrollments);
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger le profil de l\'étudiant.');
  }

  private downloadCsv(rows: string[][], filename: string): void {
    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

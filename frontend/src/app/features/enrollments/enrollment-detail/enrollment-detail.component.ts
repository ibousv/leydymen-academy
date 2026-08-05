import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ProgressComponent } from '../../../shared/components/progress/progress.component';
import { ROUTES, FORMATION_LEVELS } from '../../../shared/constants';
import { AuthService, EnrollmentService, FormationService } from '../../../core/services';
import type {
  Enrollment,
  EnrollmentStatus,
  FormationLevel,
  LessonProgress,
  Progress,
  UserRole,
} from '../../../core/models';

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  in_progress: 'En cours',
  completed: 'Terminée',
  dropped: 'Abandonnée',
};

const STATUS_VARIANTS: Record<EnrollmentStatus, BadgeVariant> = {
  in_progress: 'primary',
  completed: 'success',
  dropped: 'error',
};

/** Détail d'une inscription (spec §4.5.3). */
@Component({
  selector: 'app-enrollment-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, ProgressComponent],
  templateUrl: './enrollment-detail.component.html',
  styleUrl: './enrollment-detail.component.css',
})
export class EnrollmentDetailComponent {
  private readonly authService = inject(AuthService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly formationService = inject(FormationService);
  private readonly route = inject(ActivatedRoute);

  protected readonly ROUTES = ROUTES;

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly role = signal<UserRole | null>(null);

  protected readonly enrollment = signal<Enrollment | null>(null);
  protected readonly progress = signal<Progress | null>(null);
  protected readonly lessonTitles = signal<Record<number, string>>({});

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => this.role.set(user.role),
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isInteger(id) || id <= 0) {
        this.errorMessage.set('Inscription introuvable.');
        this.loading.set(false);
        return;
      }
      this.loadData(id);
    });
  }

  protected statusLabel(status: EnrollmentStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusVariant(status: EnrollmentStatus): BadgeVariant {
    return STATUS_VARIANTS[status];
  }

  protected formationTitle(): string {
    const enrollment = this.enrollment();
    return enrollment?.formation?.title ?? (enrollment ? `Formation #${enrollment.formationId}` : '');
  }

  protected levelLabel(level: FormationLevel | undefined): string {
    if (!level) {
      return '';
    }
    return FORMATION_LEVELS.find((entry) => entry.value === level)?.label ?? level;
  }

  protected instructorLabel(): string {
    const formation = this.enrollment()?.formation;
    if (!formation) {
      return '';
    }
    return `${formation.instructor.firstName} ${formation.instructor.lastName}`;
  }

  protected studentLabel(): string {
    const enrollment = this.enrollment();
    if (!enrollment?.student) {
      return '';
    }
    return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
  }

  protected formatDate(iso: string | undefined): string {
    if (!iso) {
      return '';
    }
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  protected formatGrade(): string {
    const grade = this.enrollment()?.grade;
    return grade == null ? '—' : `${grade}/20`;
  }

  protected lessonStatus(lesson: LessonProgress): string {
    if (lesson.completed) {
      return 'Terminée';
    }
    return lesson.percent > 0 ? 'En cours' : 'Non commencée';
  }

  protected lessonTitle(lesson: LessonProgress): string {
    return this.lessonTitles()[lesson.lessonId] ?? `Leçon ${lesson.lessonId}`;
  }

  private loadData(id: number): void {
    forkJoin({
      enrollment: this.enrollmentService.getEnrollment(id),
      progress: this.enrollmentService.getEnrollmentProgress(id),
    }).subscribe({
      next: ({ enrollment, progress }) => {
        this.enrollment.set(enrollment);
        this.progress.set(progress);
        this.loading.set(false);
        this.loadLessonTitles(enrollment.formationId);
      },
      error: (error: HttpErrorResponse) => this.handleError(error),
    });
  }

  private loadLessonTitles(formationId: number): void {
    this.formationService.getFormationModules(formationId).subscribe({
      next: (modules) => {
        const titles: Record<number, string> = {};
        for (const module of modules) {
          for (const lesson of module.lessons) {
            titles[lesson.id] = lesson.title;
          }
        }
        this.lessonTitles.set(titles);
      },
      error: () => {
        this.lessonTitles.set({});
      },
    });
  }

  private handleError(error: HttpErrorResponse): void {
    this.loading.set(false);
    const body = error.error as { message?: string } | null;
    this.errorMessage.set(body?.message ?? 'Impossible de charger le détail de l\'inscription.');
  }
}
